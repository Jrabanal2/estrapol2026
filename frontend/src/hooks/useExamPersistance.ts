// frontend/src/hooks/useExamPersistance.ts
import { usePersistedState } from './usePersistedState';

export interface ExamState {
  // Datos del examen
  questions: any[];
  currentQuestionIndex: number;
  answers: any[];
  timeElapsed: number;
  startTime: number | null;
  isCompleted: boolean;
  
  // Metadatos
  examType: string;
  topicId?: string;
  topicName?: string;
  questionCount?: number;
}

export const useExamPersistance = (examId: string) => {
  const [examState, setExamState, clearExamState] = usePersistedState<ExamState>(
    `exam_${examId}`,
    {
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      timeElapsed: 0,
      startTime: null,
      isCompleted: false,
      examType: '',
      topicId: '',
      topicName: '',
      questionCount: 0
    },
    { debounce: 500 }
  );

  // Inicializar examen
  const initializeExam = (data: {
    questions: any[];
    examType: string;
    topicId?: string;
    topicName?: string;
    questionCount?: number;
  }) => {
    setExamState(prev => ({
      ...prev,
      ...data,
      currentQuestionIndex: prev.currentQuestionIndex || 0,
      answers: prev.answers || [],
      timeElapsed: prev.timeElapsed || 0,
      startTime: prev.startTime || Date.now(),
      isCompleted: false
    }));
    console.log('🔄 Examen inicializado:', data.examType);
  };

  // Actualizar respuesta
  const updateAnswer = (questionIndex: number, answer: any) => {
    setExamState(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[questionIndex] = answer;
      return {
        ...prev,
        answers: newAnswers
      };
    });
  };

  // Cambiar pregunta actual
  const setCurrentQuestion = (index: number) => {
    setExamState(prev => ({
      ...prev,
      currentQuestionIndex: index
    }));
  };

  // Actualizar tiempo
  const updateTime = (timeElapsed: number) => {
    setExamState(prev => ({
      ...prev,
      timeElapsed
    }));
  };

  // Marcar como completado
  const markAsCompleted = () => {
    setExamState(prev => ({
      ...prev,
      isCompleted: true,
      timeElapsed: prev.timeElapsed
    }));
  };

  // Verificar si hay un examen en progreso
  const hasExamInProgress = () => {
    return examState.questions.length > 0 && 
           !examState.isCompleted && 
           examState.startTime !== null;
  };

  // Obtener progreso
  const getProgress = () => {
    const answered = examState.answers.filter(a => a !== undefined && a !== null).length;
    const total = examState.questions.length;
    return {
      answered,
      total,
      percentage: total > 0 ? (answered / total) * 100 : 0
    };
  };

  return {
    examState,
    initializeExam,
    updateAnswer,
    setCurrentQuestion,
    updateTime,
    markAsCompleted,
    clearExamState,
    hasExamInProgress,
    getProgress
  };
};