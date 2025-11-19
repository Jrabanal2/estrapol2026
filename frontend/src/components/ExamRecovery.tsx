// frontend/src/components/ExamRecovery.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExamRecovery.css';

interface ExamRecoveryProps {
  examType: string;
  onRecover?: () => void;
  onDiscard?: () => void;
}

const ExamRecovery: React.FC<ExamRecoveryProps> = ({ examType, onRecover, onDiscard }) => {
  const [showRecovery, setShowRecovery] = useState(false);
  const [examInfo, setExamInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar exámenes en progreso para este tipo
    const examKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('exam_') && !key.includes('completed')
    );

    const examsInProgress = examKeys.map(key => {
      try {
        const examData = JSON.parse(localStorage.getItem(key) || '{}');
        if (examData.examType === examType && !examData.isCompleted && examData.questions && examData.questions.length > 0) {
          return { key, ...examData };
        }
      } catch (error) {
        console.error('Error parsing exam data:', error);
      }
      return null;
    }).filter(Boolean);

    if (examsInProgress.length > 0) {
      setExamInfo(examsInProgress[0]);
      setShowRecovery(true);
    }
  }, [examType]);

  const handleRecover = () => {
    setShowRecovery(false);
    if (onRecover) {
      onRecover();
    }
    console.log('🔄 Recuperando examen en progreso...');
  };

  const handleDiscard = () => {
    if (examInfo?.key) {
      localStorage.removeItem(examInfo.key);
      console.log('🗑️ Examen descartado:', examInfo.key);
    }
    setShowRecovery(false);
    if (onDiscard) {
      onDiscard();
    }
  };

  if (!showRecovery) return null;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="exam-recovery-overlay">
      <div className="exam-recovery-modal">
        <div className="recovery-header">
          <h3>📚 Examen en Progreso Encontrado</h3>
        </div>
        
        <div className="recovery-content">
          <p>Tienes un examen de <strong>{examInfo?.topicName || examType}</strong> en progreso.</p>
          
          <div className="recovery-stats">
            <div className="stat-item">
              <span className="stat-label">Progreso:</span>
              <span className="stat-value">
                {examInfo?.answers?.filter((a: any) => a).length || 0} / {examInfo?.questions?.length || 0} preguntas
              </span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Tiempo transcurrido:</span>
              <span className="stat-value">{formatTime(examInfo?.timeElapsed || 0)}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Iniciado:</span>
              <span className="stat-value">
                {examInfo?.startTime ? new Date(examInfo.startTime).toLocaleString() : 'No disponible'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="recovery-actions">
          <button onClick={handleRecover} className="btn-recover">
            ➤ Continuar Examen
          </button>
          <button onClick={handleDiscard} className="btn-discard">
            🗑️ Empezar Nuevo Examen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamRecovery;