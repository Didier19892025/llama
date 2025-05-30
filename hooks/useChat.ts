import { useState, useEffect, useRef } from "react";
import { useSaveConversation } from "./useSaveConversation";
import { useLoadConversation } from "./useLoadConversation";
import { useBotApi } from "./useBotApi";

export interface Message {
  sender: 'user' | 'bot';
  content: string;
}

export const useChat = (username: string, conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const saveConversation = useSaveConversation(username, messages);
  const { load } = useLoadConversation(conversationId, setMessages);
  const { fetchAnswer, typeMessage } = useBotApi(username, setMessages, setIsTyping);

  useEffect(() => {
    load();
  }, [username, conversationId, load]);

  useEffect(() => {
    const handleBeforeUnload = () => saveConversation();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [messages, saveConversation]);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', content: prompt }, { sender: 'bot', content: '' }]);
    setIsLoading(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetchAnswer(prompt, controller);
      setMessages(prev => prev.slice(0, -1)); // remove empty bot message
      await typeMessage(res.answer || "Error inesperado.", 20, controller);
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
        if (newMessages[newMessages.length - 1]?.content === '') newMessages.pop();
        return [...newMessages, { sender: 'bot', content: "Solicitud cancelada." }];
      });
    }
  };

  return { messages, isLoading, isTyping, sendMessage, cancel, chatContainerRef };
};
