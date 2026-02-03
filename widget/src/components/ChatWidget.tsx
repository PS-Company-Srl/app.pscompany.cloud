import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatIcon, CloseIcon, SendIcon } from './Icons';
import { useChat } from '../hooks/useChat';
import { useAutoTrigger } from '../hooks/useAutoTrigger';
import '../styles/widget.css';

interface ChatWidgetProps {
  apiKey: string;
  apiUrl?: string;
  position?: 'bottom-right' | 'bottom-left';
  triggerDelay?: number;
  triggerMessage?: string;
  welcomeMessage?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    text?: string;
    userBubble?: string;
    botBubble?: string;
  };
  companyName?: string;
  companyLogo?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiKey,
  apiUrl = 'https://api.pscompany.cloud',
  position = 'bottom-right',
  triggerDelay = 0,
  triggerMessage,
  welcomeMessage = 'Ciao! 👋 Come posso aiutarti?',
  colors = {},
  companyName = 'Assistente',
  companyLogo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, sendMessage, isLoading, error } = useChat({
    apiKey,
    apiUrl,
    welcomeMessage,
  });

  // Auto-trigger
  useAutoTrigger({
    delay: triggerDelay,
    message: triggerMessage,
    enabled: !hasInteracted && triggerDelay > 0,
    onTrigger: () => {
      setIsOpen(true);
      setHasInteracted(true);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const customStyles = {
    '--widget-primary': colors.primary || '#0066FF',
    '--widget-secondary': colors.secondary || '#FFFFFF',
    '--widget-text': colors.text || '#333333',
    '--widget-user-bubble': colors.userBubble || colors.primary || '#0066FF',
    '--widget-bot-bubble': colors.botBubble || '#F0F0F0',
  } as React.CSSProperties;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    setHasInteracted(true);
    
    await sendMessage(message);
  }, [inputValue, isLoading, sendMessage]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setHasInteracted(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className={`pscompany-widget pscompany-widget--${position}`}
      style={customStyles}
    >
      {isOpen && (
        <div className="pscompany-chat">
          {/* Header */}
          <div className="pscompany-chat__header">
            <div className="pscompany-chat__header-info">
              {companyLogo && (
                <img src={companyLogo} alt={companyName} className="pscompany-chat__logo" />
              )}
              <div className="pscompany-chat__header-text">
                <span className="pscompany-chat__title">{companyName}</span>
                <span className="pscompany-chat__status">
                  {isLoading ? 'Sta scrivendo...' : 'Online'}
                </span>
              </div>
            </div>
            <button onClick={handleToggle} className="pscompany-chat__close-btn" aria-label="Chiudi">
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="pscompany-chat__messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`pscompany-message pscompany-message--${msg.role}`}>
                <div className="pscompany-message__bubble">{msg.content}</div>
                <span className="pscompany-message__time">{formatTime(msg.timestamp)}</span>
              </div>
            ))}
            
            {isLoading && (
              <div className="pscompany-message pscompany-message--assistant">
                <div className="pscompany-message__bubble pscompany-message__bubble--typing">
                  <span className="pscompany-typing-dot"></span>
                  <span className="pscompany-typing-dot"></span>
                  <span className="pscompany-typing-dot"></span>
                </div>
              </div>
            )}
            
            {error && <div className="pscompany-chat__error">Si è verificato un errore. Riprova.</div>}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="pscompany-chat__input-form">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="pscompany-chat__input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="pscompany-chat__send-btn"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Invia"
            >
              <SendIcon />
            </button>
          </form>

          <div className="pscompany-chat__powered">
            Powered by <a href="https://pscompany.cloud" target="_blank" rel="noopener noreferrer">PS Company</a>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={handleToggle}
        className={`pscompany-toggle ${isOpen ? 'pscompany-toggle--active' : ''}`}
        aria-label={isOpen ? 'Chiudi chat' : 'Apri chat'}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
};

export default ChatWidget;
