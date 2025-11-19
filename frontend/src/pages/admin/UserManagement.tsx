import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  adminService, 
  User, 
  PagePermission,
  AVAILABLE_PAGES,
  AVAILABLE_FUNCTIONS,
  ROLE_OPTIONS 
} from '../../services/adminService';
import './UserManagement.css';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      loadUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.searchUsers(searchTerm);
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Error al buscar usuarios');
      }
    } catch (err) {
      setError('Error de conexión al buscar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    if (!window.confirm(`¿Estás seguro de que quieres ${user.isActive ? 'desactivar' : 'activar'} a ${user.username}?`)) {
      return;
    }

    try {
      setUpdating(true);
      const response = await adminService.toggleUserStatus(user._id, !user.isActive);
      
      if (response.success) {
        // Actualizar la lista de usuarios
        const updatedUsers = users.map(u =>
          u._id === user._id ? { ...u, isActive: !user.isActive } : u
        );
        setUsers(updatedUsers);
        
        alert(`Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`);
      } else {
        alert(response.message || 'Error al cambiar el estado del usuario');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

  const handleShowPermissions = (user: User) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const handleShowSessions = async (user: User) => {
    try {
      setLoading(true);
      const response = await adminService.getUserSessions(user._id);
      
      if (response.success && response.data) {
        setSessions(response.data);
        setSelectedUser(user);
        setShowSessionsModal(true);
      } else {
        alert(response.message || 'Error al cargar sesiones');
      }
    } catch (err) {
      alert('Error de conexión al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async (user: User) => {
    if (!window.confirm(`¿Estás seguro de que quieres cerrar todas las sesiones de ${user.username}?`)) {
      return;
    }

    try {
      setUpdating(true);
      const response = await adminService.logoutUserFromAllDevices(user._id);
      
      if (response.success) {
        alert('Sesiones cerradas correctamente');
        // Recargar sesiones si el modal está abierto
        if (showSessionsModal && selectedUser?._id === user._id) {
          handleShowSessions(user);
        }
      } else {
        alert(response.message || 'Error al cerrar sesiones');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar permanentemente a ${user.username}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setUpdating(true);
      const response = await adminService.deleteUser(user._id);
      
      if (response.success) {
        // Remover usuario de la lista
        const updatedUsers = users.filter(u => u._id !== user._id);
        setUsers(updatedUsers);
        alert('Usuario eliminado correctamente');
      } else {
        alert(response.message || 'Error al eliminar usuario');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <span className="badge badge-inactive">Inactivo</span>;
    }
    
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (lastLogin && lastLogin > fiveMinutesAgo) {
      return <span className="badge badge-online">En línea</span>;
    }
    
    return <span className="badge badge-offline">Desconectado</span>;
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = ROLE_OPTIONS.find(r => r.value === role);
    return (
      <span className={`badge badge-${role}`}>
        {roleConfig?.label || role}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div className="user-management">
      <div className="admin-header">
        <h1>Administración de Usuarios</h1>
        <p>Gestiona los usuarios del sistema y sus permisos</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="search-button">
            🔍 Buscar
          </button>
          <button onClick={loadUsers} className="refresh-button">
            🔄 Actualizar
          </button>
        </div>
        <div className="stats">
          <span>Total: {users.length} usuarios</span>
          <span>Mostrando: {filteredUsers.length}</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Contacto</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className={!user.isActive ? 'inactive-user' : ''}>
                <td>
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <small>ID: {user._id.slice(-8)}</small>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div>📧 {user.email}</div>
                    <div>📞 {user.phone}</div>
                  </div>
                </td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{getStatusBadge(user)}</td>
                <td>
                  {user.lastLogin ? (
                    <div className="date-info">
                      <div>{formatDate(user.lastLogin)}</div>
                      <small>Hace {getTimeAgo(user.lastLogin)}</small>
                    </div>
                  ) : (
                    'Nunca'
                  )}
                </td>
                <td>
                  <div className="date-info">
                    <div>{formatDate(user.createdAt)}</div>
                    <small>Hace {getTimeAgo(user.createdAt)}</small>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleShowPermissions(user)}
                      className="btn-permissions"
                      title="Editar permisos"
                    >
                      🔧
                    </button>
                    <button 
                      onClick={() => handleShowSessions(user)}
                      className="btn-sessions"
                      title="Ver sesiones"
                    >
                      💻
                    </button>
                    <button 
                      onClick={() => handleLogoutAllDevices(user)}
                      className="btn-logout-all"
                      title="Cerrar todas las sesiones"
                      disabled={updating}
                    >
                      🚪
                    </button>
                    <button 
                      onClick={() => handleToggleUserStatus(user)}
                      className={`btn-status ${user.isActive ? 'deactivate' : 'activate'}`}
                      title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                      disabled={updating}
                    >
                      {user.isActive ? '⏸️' : '▶️'}
                    </button>
                    {user._id !== currentUser?.id && (
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="btn-delete"
                        title="Eliminar usuario"
                        disabled={updating}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
          </div>
        )}
      </div>

      {/* Modal de Permisos */}
      {showPermissionsModal && selectedUser && (
        <PermissionsModal
          user={selectedUser}
          onClose={() => setShowPermissionsModal(false)}
          onUpdate={loadUsers}
        />
      )}

      {/* Modal de Sesiones */}
      {showSessionsModal && selectedUser && (
        <SessionsModal
          user={selectedUser}
          sessions={sessions}
          onClose={() => setShowSessionsModal(false)}
          onLogoutAll={() => handleLogoutAllDevices(selectedUser)}
        />
      )}
    </div>
  );
};

// Helper para calcular tiempo transcurrido
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMinutes > 0) return `${diffMinutes}m`;
  return 'Ahora';
}

// Componente Modal de Permisos
const PermissionsModal = ({ user, onClose, onUpdate }: { 
  user: User; 
  onClose: () => void; 
  onUpdate: () => void;
}) => {
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPermissions([...user.permissions]);
    setRole(user.role);
  }, [user]);

  const handlePermissionChange = (pageId: string, access: boolean) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.page === pageId);
      if (existing) {
        return prev.map(p => p.page === pageId ? { ...p, access } : p);
      } else {
        return [...prev, { page: pageId, access, functions: ['view'] }];
      }
    });
  };

  const handleFunctionChange = (pageId: string, functionId: string, enabled: boolean) => {
    setPermissions(prev => {
      return prev.map(p => {
        if (p.page === pageId) {
          const functions = enabled 
            ? [...p.functions, functionId]
            : p.functions.filter(f => f !== functionId);
          return { ...p, functions };
        }
        return p;
      });
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminService.updateUserPermissions(user._id, {
        permissions,
        role
      });

      if (response.success) {
        alert('Permisos actualizados correctamente');
        onUpdate();
        onClose();
      } else {
        alert(response.message || 'Error al actualizar permisos');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal permissions-modal">
        <div className="modal-header">
          <h2>Permisos de {user.username}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="modal-content">
          {/* Selector de Rol */}
          <div className="role-section">
            <label>Rol del usuario:</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)}>
              {ROLE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Permisos por página */}
          <div className="permissions-section">
            <h3>Permisos por Página</h3>
            <div className="permissions-grid">
              {AVAILABLE_PAGES.map(page => {
                const permission = permissions.find(p => p.page === page.id);
                const hasAccess = permission?.access || false;
                const functions = permission?.functions || [];

                return (
                  <div key={page.id} className="permission-item">
                    <div className="page-header">
                      <label className="page-checkbox">
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          onChange={(e) => handlePermissionChange(page.id, e.target.checked)}
                        />
                        <span className="page-name">{page.name}</span>
                      </label>
                      <small>{page.description}</small>
                    </div>

                    {hasAccess && (
                      <div className="functions-section">
                        <label>Funciones:</label>
                        <div className="functions-grid">
                          {AVAILABLE_FUNCTIONS.map(func => (
                            <label key={func.id} className="function-checkbox">
                              <input
                                type="checkbox"
                                checked={functions.includes(func.id)}
                                onChange={(e) => handleFunctionChange(page.id, func.id, e.target.checked)}
                              />
                              <span>{func.name}</span>
                              <small>{func.description}</small>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} disabled={saving}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="save-button">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Sesiones
const SessionsModal = ({ user, sessions, onClose, onLogoutAll }: { 
  user: User;
  sessions: any[];
  onClose: () => void;
  onLogoutAll: () => void;
}) => {
  const activeSessions = sessions.filter(s => s.isActive);

  return (
    <div className="modal-overlay">
      <div className="modal sessions-modal">
        <div className="modal-header">
          <h2>Sesiones de {user.username}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="modal-content">
          <div className="sessions-stats">
            <div className="stat">
              <strong>Sesiones activas:</strong> {activeSessions.length}
            </div>
            <div className="stat">
              <strong>Total de sesiones:</strong> {sessions.length}
            </div>
          </div>

          {activeSessions.length > 0 && (
            <div className="warning-message">
              ⚠️ El usuario tiene {activeSessions.length} sesión(es) activa(s)
              <button onClick={onLogoutAll} className="btn-logout-all-small">
                Cerrar todas las sesiones
              </button>
            </div>
          )}

          <div className="sessions-list">
            {sessions.slice(0, 10).map(session => (
              <div key={session._id} className={`session-item ${session.isActive ? 'active' : 'inactive'}`}>
                <div className="session-info">
                  <div className="session-header">
                    <strong>Dispositivo: {session.deviceId.slice(-8)}</strong>
                    <span className={`session-status ${session.isActive ? 'active' : 'inactive'}`}>
                      {session.isActive ? '🟢 Activa' : '🔴 Inactiva'}
                    </span>
                  </div>
                  <div className="session-details">
                    <div>IP: {session.ipAddress}</div>
                    <div>Navegador: {session.userAgent?.split(' ')[0] || 'Desconocido'}</div>
                    <div>Inicio: {new Date(session.loginTime).toLocaleString()}</div>
                    <div>Última actividad: {new Date(session.lastActivity).toLocaleString()}</div>
                    {session.logoutTime && (
                      <div>Cierre: {new Date(session.logoutTime).toLocaleString()}</div>
                    )}
                    {session.forcedLogout && (
                      <div className="forced-logout">🔒 Cierre forzado por administrador</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sessions.length > 10 && (
            <div className="sessions-more">
              Mostrando las 10 sesiones más recientes de {sessions.length} totales
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;