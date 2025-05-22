// src/hooks/useConversations.ts
import { useState, useEffect } from "react";

export const useConversations = (userId: string) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);

      try {
        // Simula fetch desde API si usas backend (ajusta esto si tienes endpoint real)
        const serverConversations: any[] = []; // Por ahora, asumimos que vienen vacías

        // 📦 Leer las guardadas localmente
        const localDataStr = localStorage.getItem("chat_data");
        let localConversations: any[] = [];

        if (localDataStr) {
          const localData = JSON.parse(localDataStr);
          localConversations = localData.conversations || [];
        }

        // Filtramos por usuario (opcional)
        const all = [...serverConversations, ...localConversations].filter(
          conv => conv.user_id === userId
        );

        // 🧠 Ordenamos por fecha (reciente primero)
        all.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        setConversations(all);
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
        setConversations([]);
      }

      setIsLoading(false);
    };

    fetchConversations();
  }, [userId]);

  const refreshConversations = () => {
    // 🔄 Forzamos el re-fetch
    setConversations([]);
    setIsLoading(true);
    setTimeout(() => {
      // ⚠️ Este `useEffect` no se vuelve a disparar automáticamente porque no cambia `userId`
      // Así que puedes crear otro estado interno como trigger si quieres más control
      window.location.reload(); // Solución rápida: recargar la página
    }, 200);
  };

  return {
    conversations,
    isLoading,
    refreshConversations,
  };
};
