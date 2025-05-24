"use client";

import { useState, ReactElement, cloneElement } from "react";
import Header from "@/components/Header";
import NavigationBar from "@/components/NavigationBar";
import Chat from "@/components/Chat";

interface AdminLayoutProps {
  children: ReactElement;  // asumo que children es <Chat />
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <NavigationBar
          currentConversationId={currentConversationId}
          onSelectConversation={(id) => setCurrentConversationId(id)}
        />
          <main className="flex-1 overflow-y-auto">
          <Chat conversationId={currentConversationId} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
