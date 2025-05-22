"use client"; // Necesario en Next.js para indicar que este componente usa funcionalidades del cliente (como hooks)

import { useChat } from '../hooks/useChat'; // Importamos nuestro hook personalizado
import { MessageBubble } from '../components/MessageBubble'; // Burbuja de mensaje
import { ChatInput } from '../components/ChatInput'; // Campo de entrada de texto
import { useEffect, useRef, useState } from 'react'; // Hooks de React
import { TypingIndicator } from './TypingIndicator'; // Componente para mostrar "escribiendo..."

const Chat = () => {
  const [prompt, setPrompt] = useState(''); // Estado local para el texto del input
  const [username, setUsername] = useState(''); // Usuario actual (lo tomamos de cookies)
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref al textarea, útil para enfocar o redimensionar

  // ⚡ Al montar el componente, recuperamos el username desde las cookies
  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find(c => c.startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
    };

    setUsername(getCookie("username") || ''); // Si no hay cookie, se queda vacío
  }, []);

  // Hook de chat con toda la lógica que ya implementamos
  const {
    messages,         // Lista de mensajes
    isLoading,        // ¿Se está cargando respuesta?
    isTyping,         // ¿El bot está escribiendo?
    sendMessage,      // Función para enviar prompt
    cancel,           // Función para cancelar envío
    chatContainerRef, // Referencia al contenedor de scroll
  } = useChat(username);


  // Función para guardar conversación y mensajes en localStorage
const handleSaveConversation = async () => {
  if (messages.length === 0) {
    alert('No hay mensajes para guardar');
    return;
  }

  const conversationTitle = messages[1].content.slice(0, 30) || 'Sin título';

  const newConversation = {
    userId: username || 'anonymous', // Simulamos userId
    title: conversationTitle,
    messages: messages.map(msg => ({
      sender: msg.sender,
      content: msg.content,
    })),
  };

  try {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConversation),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Conversación guardada con éxito!');
    } else {
      alert('Error guardando conversación: ' + (data.error || 'Error desconocido'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    alert('Error guardando conversación: ' + errorMessage);
  }
};




  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      
      {/* 🧾 Área del historial del chat con scroll vertical */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" ref={chatContainerRef}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
          
          {/* 🔁 Renderiza cada mensaje del historial */}
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              sender={msg.sender}
              content={msg.content}
              username={username}
            />
          ))}

          {/* ✍️ Muestra indicador de "escribiendo..." */}
          {isTyping && <TypingIndicator />}
        </div>
      </div>



<div className="max-w-4xl mx-auto mt-2 px-4">
  <button
    onClick={handleSaveConversation}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Guardar Conversación
  </button>
</div>



      {/* ⌨️ Input del chat (parte inferior) */}
      <div className="w-full px-4 py-3 bg-white shadow-md overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            prompt={prompt}               // Texto del input
            setPrompt={setPrompt}         // Actualizador del texto
            onSubmit={(e: any) => {       // Al enviar formulario
              e.preventDefault();
              if (isLoading) return cancel(); // Si está cargando, lo cancela
              sendMessage(prompt);            // Enviar mensaje
              setPrompt('');                  // Limpiar input
            }}
            onCancel={cancel}             // Botón de cancelar
            isLoading={isLoading}         // Desactiva input si está cargando
            abortController={null}        // Por ahora no usamos este prop (puede eliminarse si no se usa)
            textareaRef={textareaRef}     // Ref al textarea
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
