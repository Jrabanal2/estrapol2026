import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import questionsData from '../../data/questions.json';
import topicsData from '../../data/topics.json';
import './MainExamTemas.css';

interface Topic {
  _id: string;
  name: string;
  short_name?: string;
}

interface Question {
  _id: string;
  topic_id: string;
}

const MainExamTemas = () => {
  const [user] = useState(getCurrentUser());
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [maxQuestions, setMaxQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadTopics = () => {
      try {
        let loadedTopics: Topic[] = [];
        
        if (Array.isArray(topicsData)) {
          loadedTopics = topicsData;
        } else if (topicsData.topics && Array.isArray(topicsData.topics)) {
          loadedTopics = topicsData.topics;
        } else if (topicsData.data && Array.isArray(topicsData.data)) {
          loadedTopics = topicsData.data;
        }
        
        setTopics(loadedTopics);
      } catch (error) {
        console.error('Error loading topics:', error);
        setError('Error al cargar los temas');
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, [navigate, user]);

  useEffect(() => {
    if (!selectedTopic) {
      setMaxQuestions(0);
      return;
    }

    const loadQuestionCount = () => {
      try {
        let loadedQuestions: Question[] = [];
        
        if (Array.isArray(questionsData)) {
          loadedQuestions = questionsData;
        } else if (questionsData.questions && Array.isArray(questionsData.questions)) {
          loadedQuestions = questionsData.questions;
        } else if (questionsData.data && Array.isArray(questionsData.data)) {
          loadedQuestions = questionsData.data;
        }

        const count = loadedQuestions.filter((q: Question) => q.topic_id === selectedTopic).length;
        setMaxQuestions(count);
        
        if (questionCount > count) {
          setQuestionCount(count > 0 ? count : 1);
        }
      } catch (error) {
        console.error('Error loading question count:', error);
        setError('Error al cargar el número de preguntas');
        setMaxQuestions(0);
      }
    };

    loadQuestionCount();
  }, [selectedTopic, questionCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || maxQuestions === 0) return;
    
    navigate(`/examen-temas/${selectedTopic}`, {
      state: {
        questionCount: Math.min(questionCount, maxQuestions),
        topicName: topics.find(t => t._id === selectedTopic)?.name
      }
    });
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="exam-container">
        <div className="loading-container">
          <p>Cargando temas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-container">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className='exam-container'>
      <div className='background-image'>
        <img src="/images/fondoSolo.png" alt='background' />
      </div>
      
      <div className="exam-content">
        <div className="exam-header">
          <img src="/images/logo_transparente.png" alt="Logo" />
          <h4>POLICÍA NACIONAL DEL PERÚ</h4>
          <h2>Proceso de Ascenso Suboficiales de Armas 2025 - Promoción 2026</h2>
          <h3>Módulo de Examen por Temas</h3>
        </div>

        <form className='exam-form' onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Selecciona un tema:</label>
            <select 
              className='selec-tema'
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setError(null);
              }}
              required
            >
              <option value="">-- Selecciona un tema --</option>
              {topics.map(topic => (
                <option key={topic._id} value={topic._id}>
                  {topic.short_name || topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Número de preguntas 
              <span>{maxQuestions > 0 && `(máximo ${maxQuestions})`}:</span>
            </label>
            <input
              type="number"
              min="1"
              max={maxQuestions || 1}
              value={questionCount}
              onChange={(e) => {
                const value = e.target.value;
                setQuestionCount(
                  value === "" ? "" : Math.min(Math.max(parseInt(value, 10), 1), maxQuestions || 1)
                );
              }}
              disabled={!selectedTopic || maxQuestions === 0}
              required
            />
          </div>

          {maxQuestions === 0 && selectedTopic && (
            <p className="info-message">
              No hay preguntas disponibles para este tema
            </p>
          )}

          <button 
            type="submit" 
            className="start-button"
            disabled={!selectedTopic || maxQuestions === 0}
          >
            Iniciar Examen
          </button>
        </form>
      </div>
    </div>
  );
};

export default MainExamTemas;