
import React from "react";
import { ChatProvider } from "@/context/ChatContext";
import Sidebar from "@/components/Sidebar";
import ChatRoom from "@/components/ChatRoom";

const Index = () => {
  return (
    <ChatProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar />
        
        <main className="ml-0 md:ml-64 flex-1">
          <div className="h-full">
            <ChatRoom />
          </div>
        </main>
      </div>
    </ChatProvider>
  );
};

export default Index;
