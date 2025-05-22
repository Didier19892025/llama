import { useState, useRef, useEffect } from "react";

// Estructura del mensaje que usaremos
interface Message {
  sender: 'user' | 'bot';
  content: string;
}

// Estructura esperada desde la API
interface ApiResponse {
  status: 'good' | 'bad' | 'time_out';
  answer: string;
}

// Prefijo para la clave de localStorage
const STORAGE_KEY_PREFIX = "chat_nec_";

export const useChat = (username: string) => {
  // Estado con los mensajes del chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Indica si se está esperando una respuesta
  const [isTyping, setIsTyping] = useState(false);   // Simula el efecto de "escribiendo..."
  const [abortController, setAbortController] = useState<AbortController | null>(null); // Permite cancelar solicitudes
  const chatContainerRef = useRef<HTMLDivElement>(null); // Referencia para hacer scroll automático



  // Genera la clave de almacenamiento para este usuario
  const getStorageKey = () => `${STORAGE_KEY_PREFIX}${username || 'anonymous'}`;

  // ⚡ Cargar historial guardado en localStorage al iniciar el componente
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      console.log(`[Chat] Cargando historial desde localStorage para ${username}`);
      setMessages(JSON.parse(saved));
    } else {
      console.log(`[Chat] No se encontró historial. Iniciando conversación nueva.`);
      setMessages([
        { sender: 'bot', content: "Hola, somos Nec. ¿En qué puedo ayudarte hoy?" }
      ]);
    }
  }, [username]);

  // 💾 Guardar historial cada vez que cambian los mensajes
  useEffect(() => {
    if (username) {
      console.log(`[Chat] Guardando historial en localStorage para ${username}:`, messages);
      localStorage.setItem(getStorageKey(), JSON.stringify(messages));
    }
  }, [messages, username]);

  // 🔄 Llamada a la API para obtener la respuesta del bot
  const fetchAnswer = async (query: string, controller: AbortController): Promise<ApiResponse> => {
    try {
      console.log(`[Chat] Enviando prompt al backend: "${query}"`);
      const res = await fetch("https://www.cloudware.com.co/llama_prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username || "Anonymous", query }),
        signal: controller.signal // Permite cancelar si el usuario lo decide
      });

      const data = await res.json();
      console.log(`[Chat] Respuesta del backend:`, data);
      return Array.isArray(data) ? data[0] : data;
    } catch (err: any) {
      if (err.name === 'AbortError') throw new Error('Request aborted');
      console.error(`[Chat] Error al obtener respuesta del backend:`, err);
      return { status: 'bad', answer: "Lo siento, no pudimos obtener una respuesta." };
    }
  };

  // 🧠 Simula la escritura del bot, carácter por carácter
  const typeMessage = async (text: string, delay = 20, controller: AbortController) => {
    console.log(`[Chat] Mostrando mensaje del bot con typing...`);
    let typed = '';
    setIsTyping(true);

    for (let i = 0; i < text.length; i++) {
      if (controller.signal.aborted) {
        setIsTyping(false);
        throw new Error('Typing aborted');
      }
      typed += text[i];

      // Actualiza progresivamente el mensaje del bot
      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.sender === 'bot') {
          updated[updated.length - 1].content = typed;
        } else {
          updated.push({ sender: 'bot', content: typed });
        }
        return updated;
      });

      // Espera unos milisegundos para simular "escritura"
      await new Promise(res => setTimeout(res, delay));
    }

    setIsTyping(false);
  };

  // 🚀 Enviar mensaje del usuario + recibir y mostrar respuesta del bot
  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    console.log(`[Chat] Usuario envía mensaje: "${prompt}"`);
    
    // Muestra el mensaje del usuario + spinner vacío del bot
    setMessages(prev => [...prev, { sender: 'user', content: prompt }, { sender: 'bot', content: '' }]);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetchAnswer(prompt, controller);
      const botReply = res.answer || "Error inesperado.";
      
      // Quita el mensaje vacío del bot
      setMessages(prev => prev.slice(0, -1));

      // Simula escritura del bot
      await typeMessage(botReply, 20, controller);
    } catch (err) {
      if ((err as Error).message !== 'Request aborted') {
        console.error(`[Chat] Error en sendMessage:`, err);
        setMessages(prev => prev.slice(0, -1));
        await typeMessage("Error procesando tu solicitud.", 20, controller);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  // 🛑 Cancelar solicitud actual y mostrar mensaje de cancelación
  const cancel = () => {
    if (abortController) {
      console.log(`[Chat] Cancelando solicitud en curso`);
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setIsTyping(false);

      // Borra mensaje vacío del bot y agrega mensaje de cancelación
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
    messages,           // Array con todos los mensajes
    isLoading,          // Bool: se está esperando respuesta
    isTyping,           // Bool: el bot está "escribiendo"
    sendMessage,        // Función para enviar nuevo mensaje
    cancel,             // Función para cancelar envío en curso
    chatContainerRef,    // Ref para scroll automático
  };
};
