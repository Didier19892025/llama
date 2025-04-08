"use client"

import { useState } from "react";
import { LogOut, Plus, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react"; // Importa signOut de next-auth/react

const NavigationBar = () => {
    const router = useRouter();
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    
    const handleLogout = async () => {
        try {
            // Usa la función signOut de NextAuth
            await signOut({ 
                redirect: false, // No redirigir automáticamente 
            });
            
            // Después de cerrar sesión, redirige manualmente
            router.push('/');
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <div className={`relative bg-white-800 text-gray-800 flex flex-col justify-between transition-all duration-300 ${sidebarOpen ? 'w-48' : 'w-14'} border-l border-gray-200 shadow-xl`}>
            {/* Toggle sidebar button - positioned dynamically based on sidebar state */}
            <button
                onClick={toggleSidebar}
                className={`absolute w-8 h-8 flex items-center justify-center shadow-2xl bg-gray-800 text-white rounded-full transition-all duration-300 cursor-pointer ${
                    sidebarOpen
                        ? 'right-44 top-4'
                        : 'right-10 top-4'
                }`}
            >
                {sidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            
            {/* Navigation buttons */}
            <div className="flex-grow py-8 px-2 mt-6">
                <button className="w-full flex items-center p-3 mb-4 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                    <MessageSquare className="h-5 w-5" />
                    <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Conversations</span>
                </button>
                <button className="w-full flex items-center p-3 mb-4 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                    <Plus className="h-5 w-5" />
                    <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>New Chat</span>
                </button>
            </div>
            
            <div className="hidden h-auto w-full grow md:block"></div>
            
            {/* Logout button */}
            <div className="px-2 mt-6">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 mb-4 text-red-700 hover:text-red rounded-lg transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Logout</span>
                </button>
            </div>
        </div>
    )
}

export default NavigationBar;