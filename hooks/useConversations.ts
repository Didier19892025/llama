import React, { useEffect, useState } from "react";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useConversations = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations?userId=${userId}`);
      if (!res.ok) throw new Error("Error al obtener conversaciones");
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
    const handleUpdate = () => fetchConversations();
    window.addEventListener("conversation-added", handleUpdate);
    return () => window.removeEventListener("conversation-added", handleUpdate);
  }, [fetchConversations]);

  return { conversations, fetchConversations };
};
