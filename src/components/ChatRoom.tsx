
import React from "react";
import { useChat } from "@/hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatRoom = () => {
  const { rooms, currentRoomId } = useChat();
  
  // Find the current room
  const currentRoom = rooms.find((room) => room.id === currentRoomId);
  
  return (
    <div className="flex h-full flex-col">
      {/* Room header */}
      <div className="border-b p-4">
        <div className="flex items-center">
          <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-xl font-medium">
            #
          </div>
          <div>
            <h2 className="text-lg font-semibold">{currentRoom?.name}</h2>
            {currentRoom?.description && (
              <p className="text-sm text-muted-foreground">{currentRoom.description}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>
      
      {/* Input area */}
      <MessageInput />
    </div>
  );
};

export default ChatRoom;
