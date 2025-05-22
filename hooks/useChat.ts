import { useState, useRef, useEffect } from "react";

interface Message {
  sender: 'user' | 'bot';
  content: string;
}

interface ApiResponse {
  status: 'good' | 'bad' | 'time_out';
  answer: string;
}

export const useChat = (username: string) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', content: "Hola, somos Nec. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchAnswer = async (query: string, controller: AbortController): Promise<ApiResponse> => {
    try {
      const res = await fetch("https://www.cloudware.com.co/llama_prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username || "Anonymous", query }),
        signal: controller.signal
      });

      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (err: any) {
      if (err.name === 'AbortError') throw new Error('Request aborted');
      return { status: 'bad', answer: "Lo siento, no pudimos obtener una respuesta." };
    }
  };

  const typeMessage = async (text: string, delay = 20, controller: AbortController) => {
    let typed = '';
    setIsTyping(true);
    for (let i = 0; i < text.length; i++) {
      if (controller.signal.aborted) {
        setIsTyping(false);
        throw new Error('Typing aborted');
      }
      typed += text[i];
      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.sender === 'bot') {
          updated[updated.length - 1].content = typed;
        } else {
          updated.push({ sender: 'bot', content: typed });
        }
        return updated;
      });
      await new Promise(res => setTimeout(res, delay));
    }
    setIsTyping(false);
  };

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', content: prompt }, { sender: 'bot', content: '' }]);
    setIsLoading(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetchAnswer(prompt, controller);
      const botReply = res.answer || "Error inesperado.";
      setMessages(prev => prev.slice(0, -1)); // Elimina el spinner
      await typeMessage(botReply, 20, controller);
    } catch (err) {
      if ((err as Error).message !== 'Request aborted') {
        setMessages(prev => prev.slice(0, -1));
        await typeMessage("Error procesando tu solicitud.", 20, controller);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const cancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setIsTyping(false);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.content === '') {
          newMessages.pop();
        }
        return [...newMessages, { sender: 'bot', content: "Solicitud cancelada." }];
      });
    }
  };

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    cancel,
    chatContainerRef
  };
};
