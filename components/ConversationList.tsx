"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

interface Conversation {
  id: number;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  conversations: Conversation[];
  onSelect: (id: number) => void;
  currentId: number | null;
  onDelete: (id: number) => void;
}

import dayjs from "dayjs";

export const ConversationList = ({ conversations, onSelect, currentId, onDelete }: Props) => {
  const handleDeleteClick = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "¿Eliminar conversación?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Eliminando...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Error al eliminar");

        Swal.close();

        onDelete(id);

        Swal.fire("Eliminado", "La conversación fue eliminada.", "success");
      } catch (error) {
        console.error("Error eliminando conversación:", error);
        Swal.close();
        Swal.fire("Error", "No se pudo eliminar la conversación.", "error");
      }
    }
  };

  return (
    <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
      {conversations.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`group hover:group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-800 ${
            currentId === c.id ? "bg-blue-600 border-l-4 border-blue-300" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <MessageSquare className="h-4 w-4 mr-2 text-blue-300" />
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium truncate">{c.title}</span>
                <span className="text-[8px] text-blue-200 opacity-70">
                  {dayjs(c.created_at).format("D MMM YYYY HH:mm")}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => handleDeleteClick(e, c.id)}
              className="invisible group-hover:visible p-1 hover:text-red-400 transition-colors"
              aria-label="Eliminar conversación"
              title="Eliminar"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
