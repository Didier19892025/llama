import { Message } from "./useChat";

export const useSaveConversation = (username: string, messages: Message[]) => {
  return async () => {
    if (messages.length === 0) return;

    const firstUserMessage = messages.find(m => m.sender === 'user')?.content || 'Sin título';

    try {
      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: username || "anonymous",
          title: firstUserMessage.slice(0, 100),
          messages,
        }),
      });

      window.dispatchEvent(new Event("conversation-added"));
    } catch (err) {
      console.error("Error al guardar conversación:", err);
    }
  };
};
