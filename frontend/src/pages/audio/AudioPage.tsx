import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth";
import questionsData from "../../data/questions.json";
import topicsData from "../../data/topics.json";
import "./AudioPage.css";

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

interface Voice {
  name: string;
  lang: string;
}

const AudioPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readAllOptions, setReadAllOptions] = useState(() => {
    const saved = localStorage.getItem("readAllOptions");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [startQuestion, setStartQuestion] = useState(1);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentCharIndex = useRef(0);
  const wakeLockRef = useRef<any>(null);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // --- WAKE LOCK ---
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("Wake Lock no soportado o no se pudo activar:", err);
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isPlaying]);

  // --- CARGAR VOCES ---
  useEffect(() => {
    const synth = synthRef.current;

    const loadVoices = () => {
      const allVoices = synth.getVoices();
      const spanishVoices = allVoices.filter((voice) =>
        voice.lang.toLowerCase().startsWith("es")
      );

      setAvailableVoices(spanishVoices);

      const savedVoiceName = localStorage.getItem("selectedVoiceName");
      let voiceToSet = null;

      if (savedVoiceName) {
        voiceToSet = spanishVoices.find((v) => v.name === savedVoiceName) || null;
      }

      if (!voiceToSet) {
        voiceToSet =
          spanishVoices.find((v) =>
            v.name.toLowerCase().includes("google")
          ) || spanishVoices[0] || null;
      }

      setSelectedVoice(voiceToSet);
    };

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    loadVoices();

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  // --- CARGAR DATOS DESDE JSON LOCAL ---
  useEffect(() => {
    const synth = synthRef.current;
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

        setQuestions(topicQuestions);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "No se pudo cargar el tema. Por favor intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      synth.cancel();
    };
  }, [topicId, navigate]);

  // Guardar preferencia de lectura
  useEffect(() => {
    localStorage.setItem("readAllOptions", JSON.stringify(readAllOptions));
  }, [readAllOptions]);

  // --- FORMATEAR TEXTO ---
  const formatTextForSpeech = (text: string) => {
    return text.replace(/_/g, " ").toLowerCase();
  };

  // --- TEXTO CON PAUSAS NATURALES ---
  const getTextToRead = useCallback(
    (question: Question) => {
      let textToRead = `Pregunta ${currentQuestionIndex + 1}: ${formatTextForSpeech(
        question.question_text
      )}... `;

      if (readAllOptions) {
        question.options.forEach((option, index) => {
          textToRead += `Alternativa ${String.fromCharCode(
            65 + index
          )}: ${formatTextForSpeech(option)}... `;
        });

        const correctIndex = question.options.indexOf(
          question.correct_option
        );
        textToRead += `la respuesta correcta es la alternativa ${String.fromCharCode(
          65 + correctIndex
        )}: ${formatTextForSpeech(question.correct_option)}.`;
      } else {
        textToRead += `la respuesta correcta es: ${formatTextForSpeech(
          question.correct_option
        )}.`;
      }

      return textToRead;
    },
    [currentQuestionIndex, readAllOptions]
  );

  // --- LEER PREGUNTA ---
  useEffect(() => {
    const synth = synthRef.current;

    if (
      !isPlaying ||
      questions.length === 0 ||
      currentQuestionIndex >= questions.length
    ) {
      return;
    }

    const speakQuestion = () => {
      const currentQuestion = questions[currentQuestionIndex];
      const textToRead = getTextToRead(currentQuestion);

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utteranceRef.current = utterance;

      utterance.lang = "es-ES";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      };

      utterance.onerror = (event) => {
        console.error('Error en síntesis de voz:', event);
        setIsPlaying(false);
      };

      synth.speak(utterance);
      setIsPaused(false);
    };

    speakQuestion();

    return () => {
      synth.cancel();
    };
  }, [
    isPlaying,
    currentQuestionIndex,
    questions,
    getTextToRead,
    selectedVoice,
  ]);

  // --- CONTROLES ---
  const togglePlayPause = () => {
    const synth = synthRef.current;

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      if (synth.paused && isPaused) {
        synth.resume();
        setIsPlaying(true);
        setIsPaused(false);
      } else {
        if (currentQuestionIndex >= questions.length) {
          setCurrentQuestionIndex(0);
        }
        setIsPlaying(true);
        setIsPaused(false);
      }
    }
  };

  const handleStop = () => {
    const synth = synthRef.current;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    currentCharIndex.current = 0;
  };

  const goToStartQuestion = () => {
    const newIndex = Math.min(
      Math.max(startQuestion - 1, 0),
      questions.length - 1
    );
    setCurrentQuestionIndex(newIndex);
    currentCharIndex.current = 0;
    
    const synth = synthRef.current;
    synth.cancel();
    
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const jumpToQuestion = (index: number) => {
    const newIndex = Math.min(Math.max(index - 1, 0), questions.length - 1);
    setCurrentQuestionIndex(newIndex);
    currentCharIndex.current = 0;
    
    const synth = synthRef.current;
    synth.cancel();
    
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  // --- NUEVAS FUNCIONES PARA ANTERIOR / SIGUIENTE ---
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      currentCharIndex.current = 0;
      synthRef.current.cancel();
      if (isPlaying) {
        setTimeout(() => setIsPlaying(true), 100);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      currentCharIndex.current = 0;
      synthRef.current.cancel();
      if (isPlaying) {
        setTimeout(() => setIsPlaying(true), 100);
      }
    }
  };

  // --- RENDER ---
  if (!user) return <div className="loading">Redirigiendo...</div>;
  if (isLoading) return <div className="loading">Cargando preguntas...</div>;
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
        <button onClick={() => navigate("/audio")} className="back-button">
          Volver a temas
        </button>
      </div>
    );
  }
  if (!topic || questions.length === 0)
    return (
      <div className="error">No se encontraron preguntas para este tema</div>
    );

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container-exams">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estratégico Policial</h2>
        <h3>VERSIÓN AUDIO</h3>
        <p>
          SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 -
          PROMOCIÓN 2026
        </p>
      </div>

      <div className="name_usuario">
        <p>Usuario: {user.username}</p>
      </div>

      <div className="contenedor_examen">
        <div className="contenedor_caja_preguntas">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => jumpToQuestion(index + 1)}
              className={`question-button ${
                currentQuestionIndex === index ? "active" : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="datos_preguntas">
          <div className="mobile-header">
            <div className="tema_pregunta2">{topic.short_name}</div>
          </div>
          
          <div className="encabezamiento_pregunta3">
            <div className="tema_pregunta">{topic.name}</div>
          </div>

          <div className="audio-controls">
            <div className="contenedor-voice">
              {availableVoices.length > 0 && (
                <div className="select-voice">
                  <label htmlFor="voiceSelect">SELECCIONAR VOZ:</label>
                  <select
                    id="voiceSelect"
                    value={selectedVoice?.name || ""}
                    onChange={(e) => {
                      const voice = availableVoices.find(
                        (v) => v.name === e.target.value
                      );
                      if (voice) {
                        setSelectedVoice(voice);
                        localStorage.setItem("selectedVoiceName", voice.name);
                        localStorage.setItem("selectedVoiceLang", voice.lang);
                        
                        // Reiniciar la reproducción si está en curso
                        if (isPlaying) {
                          synthRef.current.cancel();
                          setTimeout(() => setIsPlaying(true), 100);
                        }
                      }
                    }}
                  >
                    {availableVoices.map((voice, index) => (
                      <option key={index} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="control-group">
              <label className="radio-option">
                <input
                  type="radio"
                  checked={readAllOptions}
                  onChange={() => setReadAllOptions(true)}
                />
                <span>Leer todas las alternativas</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  checked={!readAllOptions}
                  onChange={() => setReadAllOptions(false)}
                />
                <span>Leer solo alternativa correcta</span>
              </label>
            </div>

            <div className="control-group start-question-control">
              <label>
                COMENZAR EN:
                <input
                  type="number"
                  min="1"
                  max={questions.length}
                  value={startQuestion}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartQuestion(
                      value === ""
                        ? ""
                        : Math.min(
                            Math.max(parseInt(value, 10), 1),
                            questions.length
                          )
                    );
                  }}
                />
              </label>
              <button onClick={goToStartQuestion} className="go-to-button">
                Ir a pregunta
              </button>
            </div>

            <div className="playback-controls">
              <button
                onClick={togglePlayPause}
                className={`control-button ${
                  isPlaying ? "pause-button" : "play-button"
                }`}
              >
                {isPlaying ? (
                  <>
                    <span className="icon">⏸</span> Pausar
                  </>
                ) : (
                  <>
                    <span className="icon">▶</span> Reproducir
                  </>
                )}
              </button>
              <button onClick={handleStop} className="control-button stop-button">
                <span className="icon">⏹</span> Detener
              </button>
            </div>
          </div>

          <div className="pregunta_completa">
            <h3 className="encabezamiento_pregunta3">
              Pregunta actual: {currentQuestionIndex + 1} de {questions.length}
            </h3>
            <div className="pregunta">
              <span>{currentQuestionIndex + 1}.</span>
              <label>{currentQuestion.question_text}</label>
            </div>

            {readAllOptions ? (
              <div className="todas_alternativas alternativas_audio">
                <ul>
                  {currentQuestion.options.map((option, index) => (
                    <li key={index}>
                      <strong>{String.fromCharCode(65 + index)}:</strong>{" "}
                      {option}
                      {option === currentQuestion.correct_option && (
                        <span className="correct-indicator"> (Correcta)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="correct-answer">
                <h4>Respuesta correcta:</h4>
                <p>
                  <strong>
                    {String.fromCharCode(
                      65 +
                        currentQuestion.options.indexOf(
                          currentQuestion.correct_option
                        )
                    )}
                    :
                  </strong>{" "}
                  {currentQuestion.correct_option}
                </p>
              </div>
            )}
          </div>

          {/* --- BOTONES ANTERIOR / SIGUIENTE --- */}
          <div className="botones">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="control-button"
            >
              Anterior
            </button>
            <button
              onClick={() => navigate("/audio")}
              className="control-button back-button"
            >
              Escoger otro tema
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="control-button"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPage;