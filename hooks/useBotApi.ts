
import { Message } from "./useChat";

export const useBotApi = (
  username: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setIsTyping: (b: boolean) => void
) => {
  const fetchAnswer = async (query: string, controller: AbortController) => {
    try {
      const res = await fetch("https://www.cloudware.com.co/llama_prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username || "Anonymous", query }),
        signal: controller.signal
      });

      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw new Error('Request aborted');
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

  return { fetchAnswer, typeMessage };
};
