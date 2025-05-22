"use client";

import { useEffect, useState } from "react";
import {
  LogOut,
  Plus,
  ChevronLeft,
  Menu,
  MessageSquare,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}


interface NavigationBarProps {
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void;
  currentConversationId?: string | null;
}

const NavigationBar = ({
  onSelectConversation,
  currentConversationId,
}: NavigationBarProps) => {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find((c) => c.startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
    };

    const userId = getCookie("username") || "anonymous";

    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/conversations?userId=${userId}`);
        if (!res.ok) throw new Error("Error al obtener conversaciones");
        const data = await res.json();
        setConversations(data);
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
      }
    };

    fetchConversations();

    const userData = {
      name: userId,
      email: userId,
      role: "user",
    };
    setUserInfo(userData);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Cerrando sesión...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      setTimeout(() => {
        Swal.close();
        router.push("/chat1");
      }, 1500);
    }
  };




  const handleSelectConversation = (conversationId: string) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full z-50 bg-custom-blue text-white border-r shadow-lg flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-80" : "w-16"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <button onClick={toggleSidebar} className="text-white">
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
          {sidebarOpen && (
            <span className="text-sm font-semibold">Conversaciones</span>
          )}
        </div>

        {sidebarOpen && (
          <div className="p-4">
            <div className="bg-blue-600 p-3 rounded-md space-y-1">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium truncate">
                  {userInfo.name || "Usuario"}
                </span>
              </div>
              <span className="text-xs text-blue-200 truncate">
                {userInfo.email}
              </span>
              <span className="text-xs bg-blue-500 px-2 py-1 rounded-full w-fit">
                {userInfo.role}
              </span>
            </div>
          </div>
        )}

       

        <div className="flex-1 overflow-y-auto p-2">
          {sidebarOpen && (
            <>
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">
                  Historial ({conversations.length})
                </span>
              </div>

              {conversations.length === 0 ? (
                <div className="text-center text-blue-300 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No hay conversaciones guardadas</p>
                  <p className="text-xs mt-1 opacity-75">Inicia un nuevo chat</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentConversationId === conversation.id
                          ? "bg-blue-600 border-l-4 border-blue-300"
                          : "hover:bg-blue-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-blue-300" />
                        <span className="text-sm font-medium truncate">
                          {conversation.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-2 mb-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-2 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && (
              <span className="ml-3 text-sm">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default NavigationBar;
