"use client";

import { LogOut, Menu } from "lucide-react";
import Logo from "@/src/ui/Logo";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";


interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen: boolean;
}


const Header = ({ onToggleSidebar, sidebarOpen }: HeaderProps) => {

  const router = useRouter();


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

  return (
    <>
      {/* Header container */}
      <div className="bg-white border-b border-gray-200 shadow-sm py-3 px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Desktop Header */}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Botón para abrir/cerrar sidebar */}
              {!sidebarOpen && (
                <button
                  onClick={onToggleSidebar}
                  className="p-1 rounded-md hover:bg-gray-100  border-gray-200/70 border focus:outline-none transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-5 w-5 text-gray-600/60 " />
                </button>
              )}
              <Logo />
            </div>

            <div className="text-right flex items-center gap-10">
              <div className=" hidden md:flex flex-col items-end">
                <h1 className="text-md font-bold text-blue-700/80">
                  Your intelligent conversation assistant
                </h1>
                <div className="flex justify-end gap-1.5">
                  <p className="text-xs text-gray-600">Powered by</p>
                  <span className="text-xs text-gray-500">Llama 3.0</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`text-blue-700 transition-colors duration-200 hover:text-red-400
                }`}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

          </div>




        </div>
      </div>

    </>
  );
};

export default Header;
