// frontend/src/pages/siecopol/SiecopolExam.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import questionsData from '../../data/questions.json';
import topicsData from '../../data/topics.json';
import { useExamPersistance } from '../../hooks/useExamPersistance';
import ExamRecovery from '../../components/ExamRecovery';
import './SiecopolExam.css';

// Distribución de preguntas por tema (temaId: cantidad)
const TOPICS_ORDER = [
  'topic_01', 'topic_02', 'topic_03', 'topic_04', 'topic_05',
  'topic_06', 'topic_07', 'topic_08', 'topic_09', 'topic_10',
  'topic_11', 'topic_12', 'topic_13', 'topic_14', 'topic_15',
  'topic_16', 'topic_17', 'topic_18', 'topic_19', 'topic_20',
  'topic_21', 'topic_22'
];

const QUESTIONS_PER_TOPIC = {
  'topic_01': 7,
  'topic_02': 1,
  'topic_03': 6,
  'topic_04': 7,
  'topic_05': 3,
  'topic_06': 8,
  'topic_07': 3,
  'topic_08': 4,
  'topic_09': 3,
  'topic_10': 8,
  'topic_11': 11,
  'topic_12': 11,
  'topic_13': 3,
  'topic_14': 3,
  'topic_15': 3,
  'topic_16': 3,
  'topic_17': 2,
  'topic_18': 2,
  'topic_19': 3,
  'topic_20': 2,
  'topic_21': 5,
  'topic_22': 2
};

const EXAM_DURATION = 2 * 60 * 60; // 2 horas en segundos

interface Question {
  _id: string;
  topic_id: string;
  question_text: string;
  options: string[];
  correct_option: string;
  tips?: string;
}

interface Topic {
  _id: string;
  name: string;
  short_name: string;
}

interface Answer {
  questionId: string;
  selected: number;
  isCorrect: boolean;
  correctOption: number;
}

interface TopicProgress {
  [key: string]: {
    name: string;
    shortName: string;
    total: number;
    indexes: number[];
  };
}

const SiecopolExam = () => {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress>({});
  const [recoveringExam, setRecoveringExam] = useState(false);

  // Sistema de persistencia
  const examId = 'siecopol_exam';
  const {
    examState,
    initializeExam,
    updateAnswer,
    setCurrentQuestion,
    updateTime,
    markAsCompleted,
    clearExamState
  } = useExamPersistance(examId);

  // Función para mezclar arrays (solo para alternativas)
  const shuffleArray = useCallback((array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  // Función para enviar el examen
  const submitExam = useCallback(() => {
    const correct = examState.answers.filter((a) => a?.isCorrect).length;
    markAsCompleted();
    clearExamState();
    
    navigate('/resultado', {
      state: {
        correct,
        incorrect: examState.answers.filter((a) => a && !a.isCorrect).length,
        unanswered: examState.questions.length - examState.answers.filter((a) => a).length,
        total: examState.questions.length,
        timeUsed: EXAM_DURATION - examState.timeElapsed,
        examType: 'SIECOPOL',
        answers: examState.answers,
        questions: examState.questions
      }
    });
  }, [examState, navigate, markAsCompleted, clearExamState]);

  // Función para finalización automática
  const handleAutoFinish = useCallback(() => {
    alert('¡El tiempo ha terminado! Su examen será enviado automáticamente.');
    submitExam();
  }, [submitExam]);

  // Cargar datos iniciales desde JSON locales
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadExamData = () => {
      try {
        setIsLoading(true);
        setError(null);

        // Si hay un examen en progreso, usarlo en lugar de cargar nuevo
        if (examState.questions.length > 0 && !examState.isCompleted && !recoveringExam) {
          console.log('🔄 Recuperando examen SIECOPOL en progreso...');
          setSelectedAnswer(examState.answers[examState.currentQuestionIndex]?.selected ?? null);
          setIsLoading(false);
          return;
        }

        // Cargar temas desde JSON local
        let loadedTopics: Topic[] = [];
        if (Array.isArray(topicsData)) {
          loadedTopics = topicsData;
        } else if (topicsData.topics && Array.isArray(topicsData.topics)) {
          loadedTopics = topicsData.topics;
        } else if (topicsData.data && Array.isArray(topicsData.data)) {
          loadedTopics = topicsData.data;
        }

        // Cargar preguntas desde JSON local
        let loadedQuestions: Question[] = [];
        if (Array.isArray(questionsData)) {
          loadedQuestions = questionsData;
        } else if (questionsData.questions && Array.isArray(questionsData.questions)) {
          loadedQuestions = questionsData.questions;
        } else if (questionsData.data && Array.isArray(questionsData.data)) {
          loadedQuestions = questionsData.data;
        }

        const questionsByTopic: Question[] = [];
        const progress: TopicProgress = {};
        let currentIndex = 0; // Contador global de preguntas

        for (const topicId of TOPICS_ORDER) {
          const count = QUESTIONS_PER_TOPIC[topicId as keyof typeof QUESTIONS_PER_TOPIC];
          if (count > 0) {
            // Filtrar preguntas por topic_id
            const topicQuestions = loadedQuestions.filter((q: Question) => q.topic_id === topicId);
            
            if (topicQuestions.length > 0) {
              // Seleccionar preguntas aleatorias según la cantidad requerida
              const selectedQuestions = topicQuestions
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.min(count, topicQuestions.length))
                .map((question: Question) => ({
                  ...question,
                  options: shuffleArray(question.options) // Mezclar alternativas
                }));

              // Encontrar el tema correspondiente
              const topic = loadedTopics.find((t: Topic) => t._id === topicId);
              
              // Configurar progreso para este tema
              progress[topicId] = {
                name: topic?.name || topicId,
                shortName: topic?.short_name || topicId,
                total: selectedQuestions.length,
                indexes: Array.from({ length: selectedQuestions.length }, (_, i) => currentIndex + i)
              };

              questionsByTopic.push(...selectedQuestions);
              currentIndex += selectedQuestions.length; // Incrementar el contador global
            }
          }
        }

        setTopicProgress(progress);

        if (questionsByTopic.length === 0) {
          throw new Error('No se pudieron cargar preguntas para el examen');
        }

        // Inicializar nuevo examen
        console.log('🆕 Inicializando nuevo examen SIECOPOL...');
        initializeExam({
          questions: questionsByTopic,
          examType: 'SIECOPOL',
          questionCount: questionsByTopic.length
        });

        setSelectedAnswer(null);

      } catch (err: any) {
        console.error('Error loading exam data:', err);
        setError(err.message || 'Error al cargar los datos del examen');
      } finally {
        setIsLoading(false);
        setRecoveringExam(false);
      }
    };

    loadExamData();
  }, [navigate, user, shuffleArray, examState, recoveringExam, initializeExam]);

  // Temporizador del examen
  useEffect(() => {
    if (examState.questions.length === 0 || examState.isCompleted) return;

    const timer = setInterval(() => {
      const newTime = examState.timeElapsed + 1;
      updateTime(newTime);
      
      // Mostrar alertas en tiempos específicos
      if (newTime === 30 * 60) {
        alert('¡Atención! Le quedan 30 minutos para finalizar el examen.');
      } else if (newTime === 15 * 60) {
        alert('¡Atención! Le quedan 15 minutos para finalizar el examen.');
      } else if (newTime === 5 * 60) {
        alert('¡Atención! Le quedan 5 minutos para finalizar el examen.');
      }
      
      // Finalizar examen cuando el tiempo se acaba
      if (newTime >= EXAM_DURATION) {
        clearInterval(timer);
        handleAutoFinish();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [examState.questions.length, examState.isCompleted, examState.timeElapsed, updateTime, handleAutoFinish]);

  // Obtener información del tema actual
  const getCurrentTopicInfo = () => {
    if (examState.questions.length === 0 || examState.currentQuestionIndex === undefined) return null;
    
    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    if (!currentQuestion) return null;

    const topicId = currentQuestion.topic_id;
    const topicInfo = topicProgress[topicId];
    if (!topicInfo) return null;

    // Encontrar la posición de la pregunta actual en este tema
    const questionPosInTopic = topicInfo.indexes.indexOf(examState.currentQuestionIndex) + 1;

    return {
      name: topicInfo.name,
      shortName: topicInfo.shortName,
      current: questionPosInTopic,
      total: topicInfo.total
    };
  };

  // Manejar selección de respuesta
  const handleAnswerSelect = (answerIndex: number) => {
    if (examState.answers[examState.currentQuestionIndex]) return;

    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    const isCorrect = currentQuestion.options[answerIndex] === currentQuestion.correct_option;
    
    setSelectedAnswer(answerIndex);
    
    const newAnswer = {
      questionId: currentQuestion._id,
      selected: answerIndex,
      isCorrect,
      correctOption: currentQuestion.options.indexOf(currentQuestion.correct_option)
    };
    
    updateAnswer(examState.currentQuestionIndex, newAnswer);
  };

  // Borrar respuesta
  const clearAnswer = () => {
    updateAnswer(examState.currentQuestionIndex, undefined);
    setSelectedAnswer(null);
  };

  // Navegación entre preguntas
  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
    setSelectedAnswer(examState.answers[index]?.selected ?? null);
    setShowQuestionNumbers(false);
  };

  const goToNext = () => {
    if (examState.currentQuestionIndex < examState.questions.length - 1) {
      goToQuestion(examState.currentQuestionIndex + 1);
    }
  };

  const goToPrev = () => {
    if (examState.currentQuestionIndex > 0) {
      goToQuestion(examState.currentQuestionIndex - 1);
    }
  };

  // Finalización del examen
  const handleFinish = () => {
    if (window.confirm('¿Estás seguro que deseas finalizar el examen?')) {
      submitExam();
    }
  };

  // Reiniciar examen
  const resetExam = () => {
    if (window.confirm('¿Estás seguro que deseas reiniciar el examen?')) {
      clearExamState();
      setSelectedAnswer(null);
      window.location.reload();
    }
  };

  // Formatear tiempo (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const timeLeft = EXAM_DURATION - seconds;
    const hrs = Math.floor(timeLeft / 3600);
    const mins = Math.floor((timeLeft % 3600) / 60);
    const secs = timeLeft % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Resumen de respuestas (1A, 2B, etc)
  const getAnswerSummary = () => {
    return examState.answers
      .map((a, i) => a ? `${i+1}${String.fromCharCode(65 + a.selected)}` : null)
      .filter(Boolean)
      .join(', ');
  };

  // Manejar recuperación de examen
  const handleRecoverExam = () => {
    setRecoveringExam(true);
  };

  const handleDiscardExam = () => {
    clearExamState();
    setRecoveringExam(true);
    window.location.reload();
  };

  if (!user) {
    return <div className="loading">Redirigiendo...</div>;
  }

  if (isLoading) {
    return <div className="loading">Cargando examen SIECOPOL...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (examState.questions.length === 0) {
    return <div className="error">No se pudieron cargar las preguntas del examen</div>;
  }

  const currentQuestion = examState.questions[examState.currentQuestionIndex];
  const currentTopic = getCurrentTopicInfo();
  const answeredCount = examState.answers.filter((a) => a !== undefined).length;

  return (
    <div className="container-exams">
      <ExamRecovery 
        examType="SIECOPOL" 
        onRecover={handleRecoverExam}
        onDiscard={handleDiscardExam}
      />

      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estrategico Policial</h2>
        <h3>Módulo de Examen Virtual</h3>
        <p>SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 - PROMOCIÓN 2026</p>
      </div>

      <div className="name_usuario">
        <p>Usuario: {user.username}</p>
        {examState.startTime && (
          <small>Iniciado: {new Date(examState.startTime).toLocaleString()}</small>
        )}
      </div>

      <div className="contenedor_examen">
        <div className={`contenedor_caja_preguntas ${showQuestionNumbers ? 'active' : ''}`}>
          {examState.questions.map((_, index) => (
            <label 
              key={index}
              className={`caja_numero_preguntas ${examState.answers[index] ? 'answered' : ''} ${index === examState.currentQuestionIndex ? 'current' : ''}`} 
              onClick={() => goToQuestion(index)}
            >
              <input 
                type="radio" 
                name="pregunta"
              />
              <span>{index + 1}</span>
            </label>
          ))}
        </div>

        <div className="datos_preguntas">
          <div className="mobile-header">
            {currentTopic && (
              <div className="tema_pregunta2">
                {currentTopic.shortName} ({currentTopic.current} de {currentTopic.total})
              </div>
            )}
          </div>

          <div className="encabezamiento_pregunta">
            <label 
              className="icono_preguntas"
              onClick={() => setShowQuestionNumbers(!showQuestionNumbers)}
            >
              <img src="/images/menu-icon.png" className="menu_icono" alt="menu" />
            </label>
            <div className="cronometro">
              <span>{formatTime(examState.timeElapsed)}</span>
            </div>
            {currentTopic && (
              <div className="tema_pregunta">
                {currentTopic.name} <span>({currentTopic.current} de {currentTopic.total})</span>
              </div>
            )}
            <button className="finish-btn" onClick={handleFinish}>Finalizar Examen</button>
          </div>
          
          <div className="pregunta_completa">
            <div className="pregunta">
              <span>{examState.currentQuestionIndex + 1}.</span>
              <label>{currentQuestion.question_text}</label>
            </div>
            
            <div className="todas_alternativas">
              {currentQuestion.options.map((option: string, index: number) => (
                <div 
                  key={index}
                  className={`alternativas ${
                    showColors && selectedAnswer === index 
                      ? examState.answers[examState.currentQuestionIndex]?.isCorrect 
                        ? 'correct' 
                        : 'incorrect'
                      : ''
                  } ${
                    showColors && examState.answers[examState.currentQuestionIndex] && 
                    currentQuestion.options[index] === currentQuestion.correct_option
                      ? 'show-correct' 
                      : ''
                  }`}
                  onClick={() => !examState.answers[examState.currentQuestionIndex] && handleAnswerSelect(index)}
                >
                  <div>
                    <input 
                      type="radio" 
                      checked={selectedAnswer === index}
                      readOnly
                    />
                  </div>
                  <span>{String.fromCharCode(65 + index)}.</span>
                  <label>{option}</label>
                </div>
              ))}
              
              <div className="botones_ayuda">
                <button className="borrar" onClick={clearAnswer}>Borrar Respuesta</button>
                <button className="activar" onClick={() => setShowColors(!showColors)}>
                  {showColors ? 'Ocultar colores' : 'Mostrar colores'}
                </button>
              </div>
            </div>
          </div>
        
          <div className="registro_respuestas">
            <ul className="resumen_resultado">
              <li>PREGUNTAS CONTESTADAS: {answeredCount}</li>
              <li>PREGUNTAS SIN CONTESTAR: {examState.questions.length - answeredCount}</li>
            </ul>
          </div>

          <div className="numero_letra_respuestas">
            {getAnswerSummary() || 'Ninguna respuesta marcada'}
          </div>
          <div className="botones">
            <button onClick={resetExam}>Reiniciar</button>
            <button onClick={goToPrev} disabled={examState.currentQuestionIndex === 0}>Anterior</button>
            <button onClick={goToNext} disabled={examState.currentQuestionIndex === examState.questions.length - 1}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiecopolExam;