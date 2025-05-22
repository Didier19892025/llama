"use client";

import { useEffect, useState } from "react";
import {
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toTitleCase } from "@/src/utils/functions";
import CookieManager from "@/src/utils/cookieManager";
import Swal from "sweetalert2";

const NavigationBar = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const userData = CookieManager.getUserInfo();
    setUserInfo({
      name: userData.name || "",
      email: userData.email || "",
      role: userData.role || "",
    });
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
          title: "Cerrando sesión...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        await fetch("https://www.cloudware.com.co/logout_llama", {
          method: "POST",
          credentials: "include",
        });

        CookieManager.clearSessionCookies();

        setUserInfo({ name: "", email: "", role: "" });

        Swal.fire({
          icon: "success",
          title: "¡Sesión cerrada!",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => {
          router.push("/chat1");
        }, 1500);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al cerrar sesión",
          text: error instanceof Error ? error.message : String(error),
          timer: 3000,
          showConfirmButton: false,
        });
      }
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 bg-custom-blue text-white border-r shadow-lg flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-60" : "w-16"}`}
      >
        {/* Toggle Button on top */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <button onClick={toggleSidebar} className="text-white">
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
          {sidebarOpen && <span className="text-sm font-semibold">Menú</span>}
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4">
            <div className="bg-blue-600 p-3 rounded-md space-y-1">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium truncate">
                  {userInfo.name ? toTitleCase(userInfo.name) : "Usuario"}
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

        {/* Navigation */}
        <div className="flex flex-col space-y-2 p-2 mt-2 flex-grow">
          <button className="flex items-center p-2 hover:bg-blue-700 rounded-lg">
            <MessageSquare className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3 text-sm">Conversations</span>}
          </button>
          <button className="flex items-center p-2 hover:bg-blue-700 rounded-lg">
            <Plus className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3 text-sm">New Chat</span>}
          </button>
        </div>

        {/* Logout */}
        <div className="p-2 mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center p-2 hover:text-red-300 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default NavigationBar;
