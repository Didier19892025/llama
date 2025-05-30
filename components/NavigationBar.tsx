"use client";

import { useState, useEffect } from "react";
import { Menu, Plus } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { SidebarUserInfo } from "./SidebarUserInfo";
import { ConversationList } from "./ConversationList";

interface Conversation {
  id: number;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  onSelectConversation?: (conversationId: string) => void;
  currentConversationId?: string | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const NavigationBar = ({
  onSelectConversation,
  currentConversationId,
  sidebarOpen,
  onToggleSidebar,
}: Props) => {
  const [userId, setUserId] = useState("anonymous");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const { conversations: fetchedConversations } = useConversations(userId);

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return undefined;
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find((c) => c.startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
    };

    const uid = getCookie("username") || "anonymous";
    setUserId(uid);
  }, []);

  // Actualizar el estado local cuando cambian las conversaciones del hook
  useEffect(() => {
    setConversations(
      fetchedConversations.map((c) => ({
        ...c,
        id: Number(c.id),
      }))
    );
  }, [fetchedConversations]);

  // Función para eliminar una conversación localmente tras borrarla en backend
  const handleDeleteConversation = (deletedId: number) => {
    setConversations((prev) => prev.filter((c) => c.id !== deletedId));
  };

  const handleNewChat = async () => {
    await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: "Conversación nueva",
        messages: [],
      }),
    });

    window.dispatchEvent(new Event("conversation-added"));
    window.location.href = "/newChat";
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full z-50 text-white flex flex-col transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-64 p-2" : "w-0"
      }`}
    >
      {sidebarOpen && (
        <div className="flex flex-col h-full bg-blue-700 rounded-2xl p-2">
          <div className="flex items-center justify-between p-2 border-b border-white/20">
            <button
              onClick={onToggleSidebar}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold ml-3">Conversaciones</span>
          </div>

          <SidebarUserInfo name={userId} />

          <div className="bg-blue-600 hover:bg-blue-800 rounded-2xl p-2 mb-2">
            <button onClick={handleNewChat} className="flex items-center cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Nuevo chat</span>
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">
                Historial ({conversations.length})
              </span>
            </div>

            <ConversationList
              conversations={conversations}
              onSelect={
                onSelectConversation
                  ? (id: number) => onSelectConversation(String(id))
                  : () => {}
              }
              currentId={
                currentConversationId !== null && currentConversationId !== undefined
                  ? Number(currentConversationId)
                  : null
              }
              onDelete={handleDeleteConversation}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationBar;
