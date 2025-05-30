// // hooks/useDeleteConversation.ts
// import { useCallback } from "react";

// export const useDeleteConversation = () => {
//   const deleteConversation = useCallback(async (id: string) => {
//     try {
//       const res = await fetch(`/api/conversations/${id}`, {
//         method: "DELETE",
//       });

//       if (!res.ok) {
//         throw new Error("Error al eliminar la conversación");
//       }

//       // Opcional: notificar a otros componentes
//       window.dispatchEvent(new Event("conversation-deleted"));
//     } catch (error) {
//       console.error("Error eliminando conversación:", error);
//     }
//   }, []);

//   return { deleteConversation };
// };
