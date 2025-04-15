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

    // Función para comunicarse con nuestra API route (proxy)
    const fetchAnswer = async (query: string): Promise<ApiResponse> => {
        try {
            console.log("Intentando conexión con API route local");
    
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "XYZ",
                    query: query
                }),
            });
    
            console.log("Respuesta recibida:", response);
    
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
    
            const responseData = await response.json();
            console.log("Datos recibidos en el cliente:", responseData);
            
            // Manejar caso cuando la respuesta es un array
            const data: ApiResponse = Array.isArray(responseData) 
                ? responseData[0] 
                : responseData;
                
            return data;
        } catch (error) {
            console.error("Error al intentar obtener respuesta de la API:", error);
            return {
                status: 'bad',
                answer: "Lo siento, no se pudo obtener una respuesta. Por favor, inténtalo de nuevo."
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
            console.error("Error en la solicitud:", error);
            // Manejo de errores en el proceso
            const errorMessage: Message = {
                sender: 'bot',
                content: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo."
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
            // Aseguramos que el textarea mantiene el foco después de completar la operación
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            }, 3000);
        }
    };

    // Efecto para hacer scroll automáticamente al final cuando los mensajes cambian
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
        // Enfocar el textarea después de actualizar los mensajes
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [messages]);

    // Efecto para asegurar el enfoque inicial cuando se carga el componente
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    // Efecto para mantener el enfoque cuando el usuario interactúa con otras partes de la página
    useEffect(() => {
        const handleClick = () => {
            if (textareaRef.current && document.activeElement !== textareaRef.current) {
                textareaRef.current.focus();
            }
        };

        // Agregamos el evento al documento entero
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

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
                    className="max-w-4xl mx-auto space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide"
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
                            className={`flex p-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%]  flex flex-wrap p-3 rounded-2xl shadow-sm ${message.sender === 'user'
                                        ? 'bg-white text-white rounded-tr-none'
                                        : 'bg-white text-white rounded-tl-none'
                                    }`}
                                style={{
                                    wordBreak: 'break-word',
                                    overflow: 'visible'
                                }}
                            >
                                <div className="flex relative gap-3 items-start w-full">
                                    {message.sender === 'bot' && (
                                       <div className=" shadow-lg absolute -top-6 -left-6 h-5 w-5 text-xs bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                       Y
                                     </div>
                                     
                                    )}
                                    <div className={`${message.sender === 'user' ? 'text-gray-800 text-xs' : 'text-gray-800 text-xs'} flex-grow whitespace-pre-wrap`}>
                                        {message.content}
                                    </div>
                                    {message.sender === 'user' && (
                                        <div className=" shadow-lg absolute -top-6 -right-6 flex-shrink-0 h-5 w-5 text-xs bg-purple-700 rounded-full flex items-center justify-center text-white font-bold">
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
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
                            autoFocus
                        />
                        <button
                            type="submit"
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isLoading || !prompt.trim()
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