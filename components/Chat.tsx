"use client";

import { CircleStop, Send, Loader2 } from "lucide-react";
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
            content: "Hola, somos Nec. ¿En qué puedo ayudarte hoy?"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [username, setUserName] = useState("");

    useEffect(() => {
        const getCookie = (username: string) => {
            const cookies = document.cookie.split("; ");
            const cookie = cookies.find((c) => c.startsWith(`${username}=`));
            return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
        };
        const username = getCookie("username");
        setUserName(username || "");
    }, []);

    // Función para obtener respuesta directamente del endpoint externo
    const fetchAnswer = async (query: string, controller: AbortController): Promise<ApiResponse> => {
        try {
            // Llamada directa al endpoint externo
            const response = await fetch("https://www.cloudware.com.co/llama_prompt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username || "Anonymous",
                    query: query
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const responseData = await response.json();
            const data: ApiResponse = Array.isArray(responseData) ? responseData[0] : responseData;
            return data;
        } catch (error: unknown) {
            // Verificar si el error es un DOMException AbortError
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new Error('Request aborted');
            }

            // Verificar si el error es de otro tipo pero tiene una propiedad name
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request aborted');
            }

            console.error("Error API:", error);
            return {
                status: 'bad',
                answer: "Lo siento, no pudimos obtener una respuesta. Por favor, intenta de nuevo."
            };
        }
    };

    const typeMessage = async (text: string, delay = 20, controller: AbortController) => {
        return new Promise<void>(async (resolve, reject) => {
            let typedText = '';
            setIsTyping(true);

            for (let i = 0; i < text.length; i++) {
                // Verificar si la petición ha sido abortada
                if (controller.signal.aborted) {
                    setIsTyping(false);
                    reject(new Error('Typing aborted'));
                    return;
                }

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

    const cancelRequest = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsLoading(false);
            setIsTyping(false);

            // Eliminar el mensaje de carga (spinner) para indicar que se ha cancelado
            setMessages(prev => {
                const newMessages = [...prev];
                // Verificamos si el último mensaje es un "spinner" del bot y lo eliminamos
                if (newMessages[newMessages.length - 1]?.sender === 'bot' &&
                    newMessages[newMessages.length - 1].content === '') {
                    newMessages.pop();
                }
                return newMessages;
            });

            // Añadir mensaje de confirmación de cancelación
            setMessages(prev => [...prev, {
                sender: 'bot',
                content: "Solicitud cancelada."
            }]);

            // Enfoca el textarea nuevamente
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 300);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        // Si hay una petición en curso, la cancelamos
        if (abortController) {
            cancelRequest();
            return;
        }

        const userMessage: Message = { sender: 'user', content: prompt };

        // Añadir el mensaje del usuario
        setMessages(prev => [...prev, userMessage]);

        // Añadir un mensaje vacío del bot para mostrar el spinner (en lugar del texto)
        setMessages(prev => [...prev, {
            sender: 'bot',
            content: ''  // Contenido vacío porque mostraremos spinner en su lugar
        }]);

        const currentPrompt = prompt;
        setPrompt('');
        setIsLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const response = await fetchAnswer(currentPrompt, controller);

            // Eliminar el mensaje de spinner para preparar la respuesta real
            setMessages(prev => {
                const newMessages = [...prev];
                // Verificamos si el último mensaje es un "spinner" del bot y lo eliminamos
                if (newMessages[newMessages.length - 1]?.sender === 'bot' &&
                    newMessages[newMessages.length - 1].content === '') {
                    newMessages.pop();
                }
                return newMessages;
            });

            let botReply: string;
            switch (response.status) {
                case "good":
                    botReply = response.answer;
                    break;
                case "bad":
                    botReply = response.answer || "Lo siento, no pude procesar tu solicitud correctamente.";
                    break;
                case "time_out":
                    botReply = "Lo siento, tu solicitud tomó demasiado tiempo. Por favor, intenta de nuevo.";
                    break;
                default:
                    botReply = "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.";
            }

            await typeMessage(botReply, 20, controller);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === 'Request aborted' || error.message === 'Typing aborted') {
                    console.log('La petición ha sido cancelada por el usuario');
                } else {
                    // Eliminar el mensaje de spinner en caso de error
                    setMessages(prev => {
                        const newMessages = [...prev];
                        if (newMessages[newMessages.length - 1]?.sender === 'bot' &&
                            newMessages[newMessages.length - 1].content === '') {
                            newMessages.pop();
                        }
                        return newMessages;
                    });

                    console.error(error);
                    await typeMessage("Lo siento, ocurrió un error al procesar tu solicitud.", 20, controller);
                }
            } else {
                // Para errores que no son instancias de Error
                setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages[newMessages.length - 1]?.sender === 'bot' &&
                        newMessages[newMessages.length - 1].content === '') {
                        newMessages.pop();
                    }
                    return newMessages;
                });

                console.error("Error desconocido:", error);
                await typeMessage("Lo siento, ocurrió un error al procesar tu solicitud.", 20, controller);
            }
        } finally {
            setIsLoading(false);
            setAbortController(null);
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
        <div className="flex flex-col relative h-screen w-full">
            {/* Área del chat */}
            <div className="flex-1">
                <div
                    ref={chatContainerRef}
                    className="max-w-4xl px-8  md:p-6 mx-auto space-y-2 max-h-[calc(100vh-152px)] overflow-y-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex mb-4 mt-6 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] sm:max-w-[75%] flex flex-wrap p-3 rounded-2xl shadow-sm ${message.sender === 'user'
                                        ? 'bg-white text-white rounded-tr-none'
                                        : 'bg-white text-white rounded-tl-none'
                                    }`}
                                style={{ wordBreak: 'break-word', overflow: 'visible' }}
                            >
                                <div className="flex relative gap-3 items-start w-full">
                                    {message.sender === 'bot' && (
                                        <div className="shadow-lg absolute -top-6 -left-8 h-5 w-10 text-xs bg-custom-blue rounded-full flex items-center justify-center text-white font-bold">
                                            NEC
                                        </div>
                                    )}
                                    <div className="text-gray-800 text-xs sm:text-sm flex-grow whitespace-pre-wrap">
                                        {/* Si el mensaje es del bot y está vacío, mostramos el spinner */}
                                        {message.sender === 'bot' && message.content === '' ? (
                                            <div className="flex items-center justify-center my-2">
                                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-solid border-blue-500 border-t-transparent"></div>
                                            </div>

                                        ) : (
                                            message.content
                                        )}
                                    </div>
                                    {message.sender === 'user' && (
                                        <div className="shadow-lg absolute -top-6 -right-6 h-5 w-5 text-xs bg-custom-blue rounded-full flex items-center justify-center text-white font-bold">
                                            {username ? username.charAt(0).toUpperCase() : 'U'}
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
                                        <span className="h-1.5 w-1.5 bg-custom-blue rounded-full animate-pulse mr-1"></span>
                                        <span className="h-1.5 w-1.5 bg-custom-blue rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="h-1.5 w-1.5 bg-custom-blue rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Área de entrada */}
            <div className="mb-10 absolute bottom-0 md:bottom-12 left-0 w-full px-4">
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
                            disabled={isLoading && !abortController}
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
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${(isLoading && !abortController) || (!isLoading && !prompt.trim())
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-custom-blue hover:bg-blue-700'
                                } text-white p-2 rounded-full transition-colors duration-200`}
                            disabled={(isLoading && !abortController) || (!isLoading && !prompt.trim())}
                        >
                            {isLoading ? (
                                abortController ? (
                                    <CircleStop className="h-4 w-4" />
                                ) : (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;