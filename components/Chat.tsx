"use client";

import { useChat } from "../hooks/useChat";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { useEffect, useRef, useState } from "react";
import { TypingIndicator } from "./TypingIndicator";
import { MessageSquare, Sparkles } from "lucide-react";


interface ChatProps {
  conversationId: string | null;
}

const Chat: React.FC<ChatProps> = ({ conversationId }) => {
  const [prompt, setPrompt] = useState("");
  const [username, setUsername] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find((c) => c.startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
    };
    setUsername(getCookie("username") || "");
  }, []);

  const {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    cancel,
    chatContainerRef,
  } = useChat(username, conversationId);




  return (
    <div className="flex gap-1 flex-col h-full w-full max-w-5xl mx-auto bg-white shadow-md rounded-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        <MessageSquare className="inline mr-2 text-gray-600" />
        Chat with NEC
        <span className="inline-flex items-center gap-1 text-yellow-500 ml-2">
          <Sparkles className="h-4 w-4" /> Llama 3.0
        </span>
      </h2>

      {/* Área de mensajes con scroll */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-6 bg-amber-50 overflow-y-auto rounded-md space-y-4"
      >
        {Array.isArray(messages) &&
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              sender={msg.sender}
              content={msg.content}
              username={username}
            />
          ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="bg-white shadow-md px-4 py-3">
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
          abortController={null}
          textareaRef={textareaRef}
        />
      </div>
      <p>Tiempo de respusta 1.2 s</p>
    </div>

  );
};

export default Chat;
