"use client"

import { Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Definimos los tipos para TypeScript
interface Message {
  sender: 'user' | 'bot';
  content: string;
}

interface ApiResponse {
  status: 'good' | 'bad' | 'time_out';
  answer: string;
}

const Chat = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: 'bot',
            content: "Hola, soy Yama. ¿En qué puedo ayudarte hoy?"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Función para comunicarse con el endpoint real
   // Función para comunicarse con el endpoint real
const fetchAnswer = async (query: string): Promise<ApiResponse> => {
    // Opción para usar mock en desarrollo - descomentar si el endpoint real no está disponible
    // return await mockFetchAnswer(query);
    
    try {
        console.log("Intentando conexión con:", "https://www.cloudware.com.co/llama_prompt");
        
        const response = await fetch("https://www.cloudware.com.co/llama_prompt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "XYZ", // Usuario fijo como en las especificaciones
                query: query
            }),
        });
        
        console.log("Respuesta recibida:", response);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error detallado:", error);
        
        // Verificar si es un error de red
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error("Error de red: El servidor no está disponible o hay problemas de conexión");
            return {
                status: "bad",
                answer: "Lo siento, no pude conectar con el servidor. Verifica tu conexión a internet o inténtalo más tarde."
            };
        }
        
        // Errores HTTP
        if (error instanceof Error && error.message.includes('Error HTTP')) {
            return {
                status: "bad",
                answer: `Error en la solicitud: ${error.message}. Por favor, inténtalo de nuevo más tarde.`
            };
        }
        
        // Otros errores
        return {
            status: "bad",
            answer: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."
        };
    }
};


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        // Agregamos el mensaje del usuario
        const userMessage: Message = { sender: 'user', content: prompt };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        
        // Guardamos el prompt y limpiamos el input
        const currentPrompt = prompt;
        setPrompt('');
        
        // Indicamos que estamos cargando
        setIsLoading(true);
        
        // Resetear altura del textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        
        try {
            // Llamamos a la API real
            const response = await fetchAnswer(currentPrompt);
            
            // Agregamos la respuesta según el estado
            let botMessage: Message;
            
            switch (response.status) {
                case "good":
                    botMessage = { sender: 'bot', content: response.answer };
                    break;
                case "bad":
                    botMessage = { 
                        sender: 'bot', 
                        content: response.answer || "Lo siento, no pude procesar tu solicitud correctamente."
                    };
                    break;
                case "time_out":
                    botMessage = { 
                        sender: 'bot', 
                        content: "Lo siento, la solicitud ha tardado demasiado tiempo. Por favor, inténtalo de nuevo."
                    };
                    break;
                default:
                    botMessage = { 
                        sender: 'bot', 
                        content: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo."
                    };
            }
            
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            // Manejo de errores en el proceso
            const errorMessage: Message = {
                sender: 'bot',
                content: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo."
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para hacer scroll automáticamente al final cuando los mensajes cambian
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Función para ajustar automáticamente la altura del textarea
    const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setPrompt(textarea.value);
    };

    return (
        <div className="flex flex-col relative h-screen">
            {/* Chat area */}
            <div className="flex-1 p-4">
                <div
                    ref={chatContainerRef}
                    className="max-w-4xl mx-auto space-y-6 max-h-[360px]  overflow-y-auto scrollbar-hide"
                    style={{
                        scrollbarWidth: 'none', /* Firefox */
                        msOverflowStyle: 'none', /* IE and Edge */
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {/* Messages */}
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] flex flex-wrap p-3 rounded-2xl shadow-sm ${
                                    message.sender === 'user'
                                        ? 'bg-purple-600 text-white rounded-tr-none'
                                        : 'bg-white rounded-tl-none'
                                }`}
                                style={{
                                    wordBreak: 'break-word',
                                    overflow: 'visible'
                                }}
                            >
                                <div className="flex gap-3 items-start w-full">
                                    {message.sender === 'bot' && (
                                        <div className="flex-shrink-0 h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mt-1">
                                            Y
                                        </div>
                                    )}
                                    <div className={`${message.sender === 'user' ? 'text-white text-xs' : 'text-gray-800 text-xs'} flex-grow whitespace-pre-wrap`}>
                                        {message.content}
                                    </div>
                                    {message.sender === 'user' && (
                                        <div className="flex-shrink-0 h-6 w-6 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold mt-1 ml-2">
                                            U
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Indicador de carga */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-3xl p-3 rounded-2xl shadow-sm bg-white rounded-tl-none">
                                <div className="flex gap-3 items-center">
                                    <div className="flex-shrink-0 h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                        Y
                                    </div>
                                    <div className="text-gray-800 text-xs">
                                        <span className="flex items-center">
                                            <span className="h-2 w-2 bg-purple-600 rounded-full animate-pulse mr-1"></span>
                                            <span className="h-2 w-2 bg-purple-600 rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></span>
                                            <span className="h-2 w-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input area */}
            <div className="mb-10 absolute bottom-12 left-0 w-full">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={adjustTextareaHeight}
                            placeholder="Escribe tu mensaje aquí..."
                            className="w-full p-3 pr-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 resize-none overflow-hidden min-h-[46px] max-h-[150px]"
                            disabled={isLoading}
                            rows={1}
                            style={{
                                overflowY: 'hidden',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                        />
                        <button
                            type="submit"
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                                isLoading || !prompt.trim() 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-purple-600 hover:bg-purple-700'
                            } text-white p-2 rounded-full transition-colors duration-200`}
                            disabled={isLoading || !prompt.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;