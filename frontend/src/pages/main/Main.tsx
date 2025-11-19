import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import './Main.css';

const Main = () => {
  const [user, setUser] = useState(null);
  const targetDate = new Date("2026-11-03T00:00:00");

  const calculateTimeLeft = () => {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      return { days: "00", hours: "00", minutes: "00", seconds: "00", reached: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      days: days < 10 ? `0${days}` : `${days}`,
      hours: hours < 10 ? `0${hours}` : `${hours}`,
      minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
      seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
      reached: false,
    };
  };

  const [time, setTime] = useState({
    previous: calculateTimeLeft(),
    current: calculateTimeLeft(),
  });

  const [animate, setAnimate] = useState({});

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      
      const animations = {
        days: newTime.days !== time.current.days,
        hours: newTime.hours !== time.current.hours,
        minutes: newTime.minutes !== time.current.minutes,
        seconds: newTime.seconds !== time.current.seconds,
      };

      setTime(prevTime => ({
        previous: prevTime.current,
        current: newTime,
      }));

      setAnimate(animations);

      setTimeout(() => {
        setAnimate({});
      }, 800);

    }, 1000);

    return () => clearInterval(timer);
  }, [time.current]);

  if (!user) return <div>Cargando...</div>;

  return (
    <div className='main-container'>
      <div className='background-image'>
        <img src="/images/fondoSolo.png" alt='img_fondo' />
      </div>

      <div className="main-content">
        <div className="main-header">
          <h1>Bienvenido! <span>{user.username}</span></h1>
        </div>

        {/* 📌 TEMPORIZADOR */}
        <div className="temporizador">
          {!time.current.reached ? (
            <div className={`countdown ${parseInt(time.current.days) <= 30 ? "urgent" : ""}`}>
              <div className="countdown__title">Faltan:</div>

              <div className="countdown__item">
                <div className="countdown__label">Días</div>
                <div className={`countdown__block ${animate.days ? "countdown__block--bounce" : ""}`}>
                  <div className="countdown__digit-group">
                    <div className="countdown__digits" data-time="a">{time.previous.days}</div>
                    <div className="countdown__digits" data-time="b">{time.current.days}</div>
                  </div>
                </div>
              </div>

              <div className="countdown__item">
                <div className="countdown__label">Horas</div>
                <div className={`countdown__block ${animate.hours ? "countdown__block--bounce" : ""}`}>
                  <div className="countdown__digit-group">
                    <div className="countdown__digits" data-time="a">{time.previous.hours}</div>
                    <div className="countdown__digits" data-time="b">{time.current.hours}</div>
                  </div>
                </div>
              </div>

              <div className="countdown__item">
                <div className="countdown__label">Minutos</div>
                <div className={`countdown__block ${animate.minutes ? "countdown__block--bounce" : ""}`}>
                  <div className="countdown__digit-group">
                    <div className="countdown__digits" data-time="a">{time.previous.minutes}</div>
                    <div className="countdown__digits" data-time="b">{time.current.minutes}</div>
                  </div>
                </div>
              </div>

              <div className="countdown__item">
                <div className="countdown__label">Segundos</div>
                <div className={`countdown__block ${animate.seconds ? "countdown__block--bounce" : ""}`}>
                  <div className="countdown__digit-group">
                    <div className="countdown__digits" data-time="a">{time.previous.seconds}</div>
                    <div className="countdown__digits" data-time="b">{time.current.seconds}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="date-reached">Estarías en la Semana de Exámenes</div>
          )}
        </div>

        {/* 📌 MENÚ DE MÓDULOS ACTUALIZADO */}
        <div className="modules-grid">
          <Link to="/temario" className="module-card">
            <img src='/images/img_temario.png' alt='temario' />
            <span>TEMARIO COMPLETO</span>
          </Link>

          <Link to="/balotario" className="module-card">
            <img src='/images/img-balotario.png' alt='balotario' />
            <span>BALOTARIO DIDÁCTICO</span>
          </Link>

          <Link to="/examen-temas" className="module-card">
            <img src='/images/logo_transparente.png' alt='examenes' />
            <span>EXÁMENES POR TEMAS</span>
          </Link>

          <Link to="/siecopol" className="module-card">
            <img src='/images/img-siecopol.png' alt='siecopol' />
            <span>EXAMEN TIPO SIECOPOL</span>
          </Link>

          <Link to="/audio" className="module-card">
            <img src='/images/img_audio.png' alt='audio' />
            <span>BALOTARIO VERSIÓN AUDIO</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Main;