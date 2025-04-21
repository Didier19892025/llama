"use client"

import { useState } from "react";
import { LogOut, Plus, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useRouter } from "next/navigation";

const NavigationBar = () => {
    const router = useRouter();
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    
    const handleLogout = async () => {
        try {
           
            // Después de cerrar sesión, redirige manualmente
            router.push('/');
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <div className={`relative bg-custom-blue text-white flex flex-col justify-between transition-all duration-300 ${sidebarOpen ? 'w-48' : 'w-0'} border-l border-gray-200 shadow-xl`}>
            {/* Toggle sidebar button - positioned dynamically based on sidebar state */}
            <button
                onClick={toggleSidebar}
                className={`absolute w-8 h-8 flex items-center justify-center shadow-2xl bg-custom-blue text-white rounded-full transition-all duration-300 cursor-pointer ${
                    sidebarOpen
                        ? 'right-44 top-4'
                        : '-right-2 top-4'
                }`}
            >
                {sidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            
            {/* Navigation buttons */}
            <div className="flex-grow py-8 px-2 mt-6">
                <button className="w-full flex items-center p-3 mb-4 hover:bg-blue-700 hover:text-white rounded-lg transition-colors">
                    <MessageSquare className="h-5 w-5" />
                    <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Conversations</span>
                </button>
                <button className="w-full flex items-center p-3 mb-4 hover:bg-blue-700 hover:text-white rounded-lg transition-colors">
                    <Plus className="h-5 w-5" />
                    <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>New Chat</span>
                </button>
            </div>
            
            <div className="hidden h-auto w-full grow md:block"></div>
            
            {/* Logout button */}
            <div className="px-2 mt-6">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 mb-4 text-white hover:text-red-800 rounded-lg transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Logout</span>
                </button>
            </div>
        </div>
    )
}

export default NavigationBar;