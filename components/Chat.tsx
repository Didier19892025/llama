"use client";

import { useChat } from "../hooks/useChat";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { useEffect, useRef, useState } from "react";
import { TypingIndicator } from "./TypingIndicator";

interface ChatProps {
  conversationId: string | null;
}

const Chat: React.FC<ChatProps> = ({ conversationId }) => {
  const [prompt, setPrompt] = useState("");
  const [username, setUsername] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

   useEffect(() => {
    if (!conversationId) {
      return;
    }

    // Cargar mensajes para esta conversación
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (!res.ok) throw new Error("Error al cargar mensajes");
        const data = await res.json();
        // setMessages(data); // Remove this line, as messages are managed by useChat
        // If you want to update messages, you should do it via your useChat hook or refetch logic
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
  }, [conversationId]);
  // Recuperar username de cookies al montar
  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find((c) => c.startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
    };
    setUsername(getCookie("username") || "");
  }, []);

  // Hook personalizado con lógica del chat
  const {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    cancel,
    chatContainerRef,
  } = useChat(username);

  // Guardar conversación en backend
  const handleSaveConversation = async () => {
    if (messages.length === 0) {
      alert("No hay mensajes para guardar");
      return;
    }

    // Intentamos usar el contenido del primer mensaje para el título, si no un título genérico
    const conversationTitle =
      messages.length > 1 && messages[1].content
        ? messages[1].content.slice(0, 30)
        : "Sin título";

    const newConversation = {
      userId: username || "anonymous",
      title: conversationTitle,
      messages: messages.map((msg) => ({
        sender: msg.sender,
        content: msg.content,
      })),
    };

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConversation),
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Conversación guardada con éxito!");
      } else {
        alert("Error guardando conversación: " + (data.error || "Error desconocido"));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert("Error guardando conversación: " + errorMessage);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Historial con scroll */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        ref={chatContainerRef}
      >
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
          {/* Mensajes */}
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              sender={msg.sender}
              content={msg.content}
              username={username}
            />
          ))}

          {/* Indicador de escribiendo */}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Botón para guardar conversación */}
      <div className="max-w-4xl mx-auto mt-2 px-4">
        <button
          onClick={handleSaveConversation}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar Conversación
        </button>
      </div>

      {/* Input de chat */}
      <div className="w-full px-4 py-3 bg-white shadow-md overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              if (isLoading) return cancel();
              if (prompt.trim() === "") return;
              sendMessage(prompt);
              setPrompt("");
            }}
            onCancel={cancel}
            isLoading={isLoading}
            abortController={null} // Puedes quitar si no usas
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
