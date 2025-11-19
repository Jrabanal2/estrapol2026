// frontend/src/pages/balotario/TopicDetail.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth";
import questionsData from "../../data/questions.json";
import topicsData from "../../data/topics.json";
import { useExamPersistance } from "../../hooks/useExamPersistance";
import ExamRecovery from "../../components/ExamRecovery";
import "./TopicDetail.css";

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

const TopicDetail = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recoveringExam, setRecoveringExam] = useState(false);

  // Sistema de persistencia
  const examId = `balotario_${topicId}`;
  const {
    examState,
    initializeExam,
    updateAnswer,
    setCurrentQuestion,
    updateTime,
    markAsCompleted,
    clearExamState
  } = useExamPersistance(examId);

  // Función para mezclar solo las alternativas
  const shuffleOptions = useCallback((options: string[]) => {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Obtener datos del tema y preguntas desde JSON local
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/");
      return;
    }
    setUser(currentUser);

    const loadData = () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar temas desde JSON local
        let loadedTopics: Topic[] = [];
        if (Array.isArray(topicsData)) {
          loadedTopics = topicsData;
        } else if (topicsData.topics && Array.isArray(topicsData.topics)) {
          loadedTopics = topicsData.topics;
        } else if (topicsData.data && Array.isArray(topicsData.data)) {
          loadedTopics = topicsData.data;
        }

        // Encontrar el tema específico
        const foundTopic = loadedTopics.find((t: Topic) => t._id === topicId);
        
        if (!foundTopic) {
          throw new Error('Tema no encontrado');
        }
        
        setTopic(foundTopic);

        // Si hay un examen en progreso, usarlo en lugar de cargar nuevo
        if (examState.questions.length > 0 && !examState.isCompleted && !recoveringExam) {
          console.log('🔄 Recuperando balotario en progreso...');
          setSelectedAnswer(examState.answers[examState.currentQuestionIndex]?.selected ?? null);
          setIsLoading(false);
          return;
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

        // Filtrar preguntas por topic_id
        const topicQuestions = loadedQuestions.filter((q: Question) => q.topic_id === topicId);

        if (topicQuestions.length === 0) {
          throw new Error('No hay preguntas para este tema');
        }

        // Inicializar nuevo balotario
        console.log('🆕 Inicializando nuevo balotario...');
        initializeExam({
          questions: topicQuestions.map((question: Question) => ({
            ...question,
            options: shuffleOptions(question.options),
          })),
          examType: 'BALOTARIO',
          topicId: topicId!,
          topicName: foundTopic.name,
          questionCount: topicQuestions.length
        });

        setSelectedAnswer(null);

      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "No se pudo cargar el tema. Por favor intenta nuevamente.");
      } finally {
        setIsLoading(false);
        setRecoveringExam(false);
      }
    };

    loadData();
  }, [topicId, navigate, shuffleOptions, examState, recoveringExam, initializeExam]);

  // Temporizador
  useEffect(() => {
    if (examState.questions.length === 0 || examState.isCompleted) return;

    const timer = setInterval(() => {
      updateTime(examState.timeElapsed + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState.questions.length, examState.isCompleted, examState.timeElapsed, updateTime]);

  // Manejar selección de respuesta
  const handleAnswerSelect = (answerIndex: number) => {
    if (examState.answers[examState.currentQuestionIndex]) return;

    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    const isCorrect = currentQuestion.options[answerIndex] === currentQuestion.correct_option;

    setSelectedAnswer(answerIndex);

    const answer = {
      questionId: currentQuestion._id,
      selected: answerIndex,
      isCorrect,
      correctOption: currentQuestion.options.indexOf(currentQuestion.correct_option)
    };
    
    updateAnswer(examState.currentQuestionIndex, answer);
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

  // Finalizar examen
  const handleFinish = () => {
    if (window.confirm("¿Estás seguro que deseas finalizar el examen?")) {
      const correct = examState.answers.filter((a) => a?.isCorrect).length;
      markAsCompleted();
      clearExamState();
      
      navigate("/resultado", {
        state: {
          correct,
          incorrect: examState.answers.filter(a => a && !a.isCorrect).length,
          total: examState.questions.length,
          time: examState.timeElapsed,
          topic: topic?.name,
          answers: examState.answers,
          questions: examState.questions,
          examType: 'BALOTARIO'
        },
      });
    }
  };

  // Mostrar ayuda
  const showHelp = () => {
    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    alert(
      `TIP: ${currentQuestion?.tips || "No hay sugerencias para esta pregunta"}`
    );
  };

  // Reiniciar examen (mezcla solo alternativas)
  const resetExam = () => {
    if (window.confirm("¿Estás seguro que deseas reiniciar el examen?")) {
      clearExamState();
      setSelectedAnswer(null);
      
      const shuffledQuestions = examState.questions.map((q: any) => ({
        ...q,
        options: shuffleOptions(q.options),
      }));
      
      initializeExam({
        questions: shuffledQuestions,
        examType: 'BALOTARIO',
        topicId: topicId!,
        topicName: topic?.name || '',
        questionCount: shuffledQuestions.length
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
    return <div className="loading">Cargando tema y preguntas...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (!topic || examState.questions.length === 0) {
    return (
      <div className="error">No se encontraron preguntas para este tema</div>
    );
  }

  const currentQuestion = examState.questions[examState.currentQuestionIndex];
  const correctAnswers = examState.answers.filter((a) => a?.isCorrect).length;
  const totalAnswered = examState.answers.filter((a) => a !== undefined).length;

  return (
    <div className="container-exams">
      <ExamRecovery 
        examType="BALOTARIO" 
        onRecover={handleRecoverExam}
        onDiscard={handleDiscardExam}
      />

      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estrategico Policial</h2>
        <h3>BALOTARIO DIDÁCTICO</h3>
        <p>
          SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 -
          PROMOCIÓN 2026
        </p>
      </div>

      <div className="name_usuario">
        <p>Usuario: {user.username}</p>
        {examState.startTime && (
          <small>Iniciado: {new Date(examState.startTime).toLocaleString()}</small>
        )}
      </div>

      <div className="contenedor_examen">
        <div
          className={`contenedor_caja_preguntas ${
            showQuestionNumbers ? "active" : ""
          }`}
        >
          {examState.questions.map((_, index) => (
            <div
              key={index}
              className={`caja_numero_preguntas ${
                examState.answers[index] ? "answered" : ""
              } ${index === examState.currentQuestionIndex ? "current" : ""}`}
              onClick={() => goToQuestion(index)}
            >
              <input
                type="radio"
                name="pregunta"
                checked={examState.currentQuestionIndex === index}
                readOnly
              />
              <span>{index + 1}</span>
            </div>
          ))}
        </div>

        <div className="datos_preguntas">
          <div className="mobile-header">
            <div className="tema_pregunta2">{topic.short_name}</div>
          </div>

          <div className="encabezamiento_pregunta">
            <label
              className="icono_preguntas"
              onClick={() => setShowQuestionNumbers(!showQuestionNumbers)}
            >
              <img
                src="/images/menu-icon.png"
                className="menu_icono"
                alt="icon"
              />
            </label>
            <div className="cronometro">
              <span>{formatTime(examState.timeElapsed)}</span>
            </div>
            <div className="tema_pregunta">{topic.name}</div>
            <button className="finish-btn" onClick={handleFinish}>
              Finalizar Examen
            </button>
          </div>

          <div className="pregunta_completa">
            <div className="pregunta">
              <span>{examState.currentQuestionIndex + 1}.</span>
              <label>{currentQuestion.question_text}</label>
            </div>

            <div className="todas_alternativas">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`alternativas ${
                    selectedAnswer === index
                      ? examState.answers[examState.currentQuestionIndex]?.isCorrect
                        ? "correct"
                        : "incorrect"
                      : ""
                  } ${
                    examState.answers[examState.currentQuestionIndex] &&
                    currentQuestion.options[index] ===
                      currentQuestion.correct_option
                      ? "show-correct"
                      : ""
                  }`}
                  onClick={() =>
                    !examState.answers[examState.currentQuestionIndex] && handleAnswerSelect(index)
                  }
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

              {/* ✅ Botón de ayuda solo si hay contenido en la BD */}
              {currentQuestion?.tips && currentQuestion.tips.trim() !== "" && (
                <button className="ayuda" onClick={showHelp}>
                  Ayuda
                </button>
              )}
            </div>
          </div>

          <div className="registro_respuestas">
            <ul className="resumen_resultado">
              <li>CORRECTAS: {correctAnswers}</li>
              <li>INCORRECTAS: {totalAnswered - correctAnswers}</li>
              <li>TOTAL RESPONDIDAS: {totalAnswered}</li>
              <li>TOTAL PREGUNTAS: {examState.questions.length}</li>
            </ul>
            <div className="botones">
              <button onClick={resetExam}>Reiniciar</button>
              <button onClick={goToPrev} disabled={examState.currentQuestionIndex === 0}>
                Anterior
              </button>
              <button
                onClick={goToNext}
                disabled={examState.currentQuestionIndex === examState.questions.length - 1}
              >
                Siguiente
              </button>
              <button onClick={() => navigate("/balotario")}>
                Escoger otro tema
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;