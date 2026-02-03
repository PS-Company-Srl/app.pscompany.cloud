import { useState, useCallback, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseChatOptions {
  apiKey: string;
  apiUrl: string;
  welcomeMessage?: string;
}

export function useChat({ apiKey, apiUrl, welcomeMessage }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('pscompany_session_id');
    if (stored) return stored;
    const newId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pscompany_session_id', newId);
    return newId;
  });

  useEffect(() => {
    if (welcomeMessage && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      }]);
    }
  }, [welcomeMessage]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          message: content,
          session_id: sessionId,
          conversation_id: conversationId,
          channel: 'web',
          visitor_info: {
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }]);
        
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }
      } else {
        throw new Error(data.error || 'Errore sconosciuto');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Errore');
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Mi dispiace, si è verificato un problema. Riprova tra qualche istante.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, apiUrl, sessionId, conversationId]);

  return { messages, sendMessage, isLoading, error, conversationId };
}
