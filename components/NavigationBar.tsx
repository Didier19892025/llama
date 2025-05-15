"use client";

import { useEffect, useState } from "react";
import {
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toTitleCase } from "@/src/utils/functions";
import Swal from "sweetalert2";

const NavigationBar = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find((c) => c.startsWith(`${name}=`));
      return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
    };
    const name = getCookie("name");
    setName(name || "");
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
      try {
        Swal.fire({
          icon: "success",
          title: "¡Sesión cerrada!",
          text: "Has cerrado sesión correctamente",
          confirmButtonColor: "#3085d6",
          timer: 1500,
          showConfirmButton: false,
        });

        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text:
            error instanceof Error ? error.message : "Error al cerrar sesión",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    }
  };

  return (
    <>
      {/* Overlay Background */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full z-50 bg-custom-blue text-white border-l shadow-xl flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0 w-60" : "translate-x-full w-60"}`}
      >
        {/* User Info */}
        <div className="mt-6 px-4">
          <div className="w-full flex items-center justify-start bg-blue-600 p-3 rounded-md">
            <span className="text-sm font-medium truncate">
              {toTitleCase(name)}
            </span>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="flex-grow py-6 px-2 mt-4 space-y-2">
          <button className="w-full flex items-center p-3 hover:bg-blue-700 rounded-lg transition-colors">
            <MessageSquare className="h-5 w-5" />
            <span className="ml-3 text-sm font-medium">Conversations</span>
          </button>
          <button className="w-full flex items-center p-3 hover:bg-blue-700 rounded-lg transition-colors">
            <Plus className="h-5 w-5" />
            <span className="ml-3 text-sm font-medium">New Chat</span>
          </button>
        </div>

        {/* Logout */}
        <div className="px-2 mb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3 text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Toggle Button that moves with sidebar */}
      <button
        onClick={toggleSidebar}
        className={`fixed flex items-center justify-center shadow-2xl 
          bg-custom-blue text-white cursor-pointer z-50
          h-24 w-4 rounded-md 
          top-1/2 transform -translate-y-1/2 transition-all duration-300
          ${sidebarOpen ? "right-58" : "-right-1"}`}
      >
        {sidebarOpen ? (
          <ChevronRight size={18} className="mr-1" />
        ) : (
          <ChevronLeft size={18}  className="mr-1" />
        )}
      </button>
    </>
  );
};

export default NavigationBar;
