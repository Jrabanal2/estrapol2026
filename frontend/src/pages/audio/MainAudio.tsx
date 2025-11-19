import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import topicsData from '../../data/topics.json'; // Ajusta la ruta según tu estructura
import './MainAudio.css';

// Define la interfaz para los temas
interface Topic {
  _id: string;
  name: string;
  short_name?: string;
}

const MainAudio = () => {
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Cargar temas desde el archivo JSON local
    const loadTopics = () => {
      try {
        // Si topicsData es un array directamente
        if (Array.isArray(topicsData)) {
          setTopics(topicsData);
        } 
        // Si topicsData es un objeto con una propiedad que contiene el array
        else if (topicsData.topics && Array.isArray(topicsData.topics)) {
          setTopics(topicsData.topics);
        }
        // Si topicsData es un objeto con otra estructura
        else if (topicsData.data && Array.isArray(topicsData.data)) {
          setTopics(topicsData.data);
        }
        else {
          console.warn('Estructura del archivo JSON no reconocida:', topicsData);
          setTopics([]);
        }
      } catch (error) {
        console.error('Error loading topics from JSON:', error);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  if (!user || loading) return <div>Cargando...</div>;

  return (
    <div className='audio-container'>
      <div className='background-image'>
        <img src="/images/fondoSolo.png" alt='background' />
      </div>
      
      <div className="audio-content">
        <h1>{user.username}</h1>
        <p>¿Qué tema deseas escuchar?</p>

        <div className="topics-grid">
          {topics.map(topic => (
            <Link 
              key={topic._id} 
              to={`/audio/${topic._id}`}
              className="topics-card"
            >
              <img src='/images/img_audio.png' alt='topic' />
              <span>{topic.short_name || topic.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainAudio;