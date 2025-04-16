"use client";

import { Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Tipos para TypeScript
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
            content: "Hi, we're Nec. How can I help you today?"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Función para obtener respuesta de la API
    const fetchAnswer = async (query: string): Promise<ApiResponse> => {
        try {
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

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const responseData = await response.json();
            const data: ApiResponse = Array.isArray(responseData) ? responseData[0] : responseData;
            return data;
        } catch (error) {
            console.error("Error API:", error);
            return {
                status: 'bad',
                answer: "Lo siento, no se pudo obtener una respuesta. Por favor, inténtalo de nuevo."
            };
        }
    };

    // Efecto de tipeo
    const typeMessage = async (text: string, delay = 20) => {
        return new Promise<void>(async (resolve) => {
            let typedText = '';
            setIsTyping(true);

            for (let i = 0; i < text.length; i++) {
                typedText += text[i];
                setMessages(prev => {
                    const updated = [...prev];
                    // Si ya hay un mensaje del bot escribiendo, reemplazar
                    if (updated[updated.length - 1]?.sender === 'bot') {
                        updated[updated.length - 1] = { sender: 'bot', content: typedText };
                    } else {
                        updated.push({ sender: 'bot', content: typedText });
                    }
                    return updated;
                });
                await new Promise(res => setTimeout(res, delay));
            }

            setIsTyping(false);
            resolve();
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        const userMessage: Message = { sender: 'user', content: prompt };
        setMessages(prev => [...prev, userMessage]);

        const currentPrompt = prompt;
        setPrompt('');
        setIsLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const response = await fetchAnswer(currentPrompt);

            let botReply: string;
            switch (response.status) {
                case "good":
                    botReply = response.answer;
                    break;
                case "bad":
                    botReply = response.answer || "Lo siento, no pude procesar tu solicitud correctamente.";
                    break;
                case "time_out":
                    botReply = "Lo siento, la solicitud ha tardado demasiado tiempo. Por favor, inténtalo de nuevo.";
                    break;
                default:
                    botReply = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.";
            }

            await typeMessage(botReply);
        } catch (error) {
            console.error("Error en el submit:", error);
            await typeMessage("Lo siento, ha ocurrido un error al procesar tu solicitud.");
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 300);
        }
    };

    // Scroll automático al final
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleClick = () => {
            if (textareaRef.current && document.activeElement !== textareaRef.current) {
                textareaRef.current.focus();
            }
        };
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        setPrompt(textarea.value);
    };

    return (
        <div className="flex flex-col relative h-screen">
            {/* Área del chat */}
            <div className="flex-1 ">
                <div
                    ref={chatContainerRef}
                    className="max-w-4xl p-4 mx-auto space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex  px-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] flex flex-wrap p-3 rounded-2xl shadow-sm ${message.sender === 'user'
                                    ? 'bg-white text-white rounded-tr-none'
                                    : 'bg-white text-white rounded-tl-none'
                                    }`}
                                style={{ wordBreak: 'break-word', overflow: 'visible' }}
                            >
                                <div className="flex relative gap-3 items-start w-full">
                                    {message.sender === 'bot' && (
                                        <div className="shadow-lg absolute -top-6 -left-8 h-5 w-10 text-xs bg-custom-blue rounded-full flex items-center justify-center text-white font-bold">
                                            Nec
                                        </div>
                                    )}
                                    <div className="text-gray-800 text-xs flex-grow whitespace-pre-wrap">
                                        {message.content}
                                    </div>
                                    {message.sender === 'user' && (
                                        <div className="shadow-lg absolute -top-6 -right-6 h-5 w-5 text-xs bg-custom-blue rounded-full flex items-center justify-center text-white font-bold">
                                            D
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}


                    {isTyping && (
                        <div className="flex justify-between items-center px-6 rounded-lg mb-2">
                            <div className="flex gap-3 items-center">
                                <div className="text-gray-800 text-xs">
                                    <span className="flex items-center">
                                        <span className="h-1.5 w-1.5  bg-custom-blue rounded-full animate-pulse mr-1"></span>
                                        <span className="h-1.5  w-1.5  bg-custom-blue rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="h-1.5  w-1.5  bg-custom-blue rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Área de entrada */}
            <div className=" mb-10 absolute bottom-12 left-0 w-full">
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
                            className="w-full p-3 pr-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent bg-gray-50 resize-none overflow-hidden min-h-[46px] max-h-[150px]"
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
                                : 'bg-custom-blue hover:bg-custom-blue'
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
