"use client";

import { useState } from "react";
import Header from "@/components/Header";
import NavigationBar from "@/components/NavigationBar";
import Chat from "@/components/Chat";



const AdminLayout = () => {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden">
      <Header onToggleSidebar={toggleSidebar}  sidebarOpen={sidebarOpen}/>
      <div className="flex flex-1 overflow-hidden">
        <NavigationBar
          currentConversationId={currentConversationId}
          onSelectConversation={(id) => setCurrentConversationId(id)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <main className="flex-1 py-2">
          <Chat conversationId={currentConversationId} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;