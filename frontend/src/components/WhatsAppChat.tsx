import React, { useState } from 'react';
import './WhatsAppChat.css';

const WhatsAppChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChat = () => {
    const phoneNumber = '51948593198';
    const message = 'Hola! deseo información para obtener mi usuario y contraseña para ingresar al módulo de Estudio para el Ascenso de Suboficiales de Armas';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón flotante */}
      <div 
        className="whatsapp-button" 
        onClick={toggleChat}
        role="button"
        tabIndex={0}
        aria-label="Abrir chat de WhatsApp"
        onKeyDown={(e) => e.key === 'Enter' && toggleChat()}
      >
        <img src="/images/whatsapp-white.svg" alt="WhatsApp" />
      </div>

      {/* Diálogo del chat */}
      {isOpen && (
        <div className="whatsapp-dialog">
          <div className="whatsapp-header">
            <img className="iconWhatsapp" src="/images/whatsapp-white.svg" alt="WhatsApp" />
            <span className="text-whatsapp">WhatsApp</span>
            <button 
              className="close-dialog" 
              onClick={closeChat}
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>
          <div className="whatsapp-content">
            <p className="whatsapp-message">Hola! amigo PNP</p>
            <p className="whatsapp-message">¿Estudiando para tu ASCENSO?</p>
            <p className="whatsapp-message">Escríbenos ...</p>
            <button 
              className="openChatButton" 
              onClick={handleOpenChat}
            >
              Abrir Chat
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppChat;