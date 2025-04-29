"use client";

import { useEffect, useState } from "react";
import { LogOut, Plus, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { toTitleCase } from "@/src/utils/functions";

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

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div
      className={`relative bg-custom-blue text-white flex flex-col justify-between transition-all duration-300 ease-in-out 
      ${sidebarOpen ? "w-46" : "w-0"} overflow-hidden border-l border-gray-200 shadow-xl`}
    >
      {/* Sidebar Toggle Button */}
      <button
                onClick={toggleSidebar}
                className={`fixed flex items-center justify-center shadow-2xl 
                bg-custom-blue text-white cursor-pointer
                h-24 w-6 rounded-l-md rounded-r-md 
                top-1/2 transform -translate-y-1/2 transition-all duration-300
                ${sidebarOpen ? 'right-44' : '-right-3'}`}
            >
                {sidebarOpen ? <ChevronRight size={18} className="mr-2" /> : <ChevronLeft size={18} className="mr-3" />}
            </button>

      {/* User Name */}
      {sidebarOpen && (
        <div className="mt-6 px-4">
          <div className="w-full flex items-center justify-start bg-blue-600 p-3 rounded-md">
            <span className="text-sm font-medium truncate">{toTitleCase(name)}</span>
          </div>
        </div>
      )}

      {/* Navigation Options */}
      <div className="flex-grow py-6 px-2 mt-4 space-y-2">
        <button className="w-full flex items-center p-3 hover:bg-blue-700 rounded-lg transition-colors">
          <MessageSquare className="h-5 w-5" />
          <span className={`ml-3 text-sm font-medium ${!sidebarOpen && "hidden"}`}>
            Conversations
          </span>
        </button>
        <button className="w-full flex items-center p-3 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus className="h-5 w-5" />
          <span className={`ml-3 text-sm font-medium ${!sidebarOpen && "hidden"}`}>
            New Chat
          </span>
        </button>
      </div>

      {/* Logout */}
      <div className="px-2 mb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className={`ml-3 text-sm font-medium ${!sidebarOpen && "hidden"}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default NavigationBar;
