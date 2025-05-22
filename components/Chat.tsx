"use client";

import { useChat } from '../hooks/useChat';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { useEffect, useRef, useState } from 'react';
import { TypingIndicator } from './TypingIndicator';

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [username, setUsername] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find(c => c.startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
    };
    setUsername(getCookie("username") || '');
  }, []);

  const { messages, isLoading, isTyping, sendMessage, cancel, chatContainerRef } = useChat(username);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
  {/* Área del chat con scroll vertical */}
  <div className="flex-1 overflow-y-auto overflow-x-hidden" ref={chatContainerRef}>
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 ">
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} sender={msg.sender} content={msg.content} username={username} />
      ))}
      {isTyping && <TypingIndicator />}
    </div>
  </div>

  {/* Input en la parte inferior */}
  <div className="w-full px-4 py-3 bg-white shadow-md overflow-x-hidden">
    <div className="max-w-4xl mx-auto">
      <ChatInput
        prompt={prompt}
        setPrompt={setPrompt}
        onSubmit={(e: any) => {
          e.preventDefault();
          if (isLoading) return cancel();
          sendMessage(prompt);
          setPrompt('');
        }}
        onCancel={cancel}
        isLoading={isLoading}
        abortController={null}
        textareaRef={textareaRef}
      />
    </div>
  </div>
</div>

  );
};

export default Chat;
