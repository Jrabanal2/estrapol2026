import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import topicsData from '../../data/topics.json';
import './MainBallot.css';

interface Topic {
  _id: string;
  name: string;
  short_name?: string;
}

const MainBallot = () => {
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const loadTopics = () => {
      try {
        let loadedTopics: Topic[] = [];
        
        if (Array.isArray(topicsData)) {
          loadedTopics = topicsData;
        } else if (topicsData.topics && Array.isArray(topicsData.topics)) {
          loadedTopics = topicsData.topics;
        } else if (topicsData.data && Array.isArray(topicsData.data)) {
          loadedTopics = topicsData.data;
        } else {
          console.warn('Estructura del archivo JSON no reconocida:', topicsData);
          loadedTopics = [];
        }
        
        setTopics(loadedTopics);
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
    <div className='ballot-container'>
      <div className='background-image'>
        <img src="/images/fondoSolo.png" alt='background' />
      </div>
      
      <div className="ballot-content">
        <h1>{user.username}</h1>
        <p>¿Qué BALOTARIO DIDÁCTICO deseas practicar?</p>

        <div className="topics-grid">
          {topics.map(topic => (
            <Link 
              key={topic._id} 
              to={`/balotario/${topic._id}`}
              className="topics-card"
            >
              <img src='/images/img-balotario.png' alt='topic' />
              <span>{topic.short_name || topic.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainBallot;