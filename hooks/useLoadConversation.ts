import { Message } from "./useChat";

export const useLoadConversation = (
  conversationId: string | null,
  setMessages: (msgs: Message[]) => void
) => {
  const load = async () => {
    if (!conversationId) {
      setMessages([{ sender: 'bot', content: "Hola, somos Nec. ¿En qué puedo ayudarte hoy?" }]);
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      const data = await res.json();

      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        throw new Error("Formato inesperado");
      }
    } catch (err) {
      console.error(err);
      setMessages([{ sender: 'bot', content: "No se pudo cargar la conversación." }]);
    }
  };

  return { load };
};
