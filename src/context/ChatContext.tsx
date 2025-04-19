
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { generateUserId, generateUsername } from "@/lib/utils/chatUtils";

export interface Message {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: number;
  roomId: string;
}

export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastActive: number;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
}

interface ChatContextType {
  messages: Message[];
  users: User[];
  rooms: Room[];
  currentUser: User | null;
  currentRoomId: string;
  sendMessage: (text: string) => void;
  joinRoom: (roomId: string) => void;
  setUsername: (username: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Default rooms
const DEFAULT_ROOMS: Room[] = [
  { id: "general", name: "General", description: "General chat for everyone" },
  { id: "random", name: "Random", description: "Random discussions" },
  { id: "support", name: "Support", description: "Get help here" },
];

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string>("general");
  const [rooms] = useState<Room[]>(DEFAULT_ROOMS);

  // Initialize current user
  useEffect(() => {
    const userId = generateUserId();
    const username = generateUsername();
    
    // Create current user
    const user: User = {
      id: userId,
      username,
      isOnline: true,
      lastActive: Date.now(),
    };
    
    setCurrentUser(user);
    
    // Add some mock users
    const mockUsers: User[] = [
      { id: "user1", username: "TechGuru", isOnline: true, lastActive: Date.now() },
      { id: "user2", username: "CodingWizard", isOnline: true, lastActive: Date.now() },
      { id: "user3", username: "WebDeveloper", isOnline: false, lastActive: Date.now() - 3600000 },
      { id: "user4", username: "DesignMaster", isOnline: true, lastActive: Date.now() },
      { id: "user5", username: "DataScientist", isOnline: false, lastActive: Date.now() - 7200000 },
    ];
    
    setUsers([...mockUsers, user]);
    
    // Add some mock messages
    const mockMessages: Message[] = [
      {
        id: "msg1",
        text: "Hello everyone! Welcome to the chat app.",
        userId: "user1",
        username: "TechGuru",
        timestamp: Date.now() - 86400000,
        roomId: "general",
      },
      {
        id: "msg2",
        text: "Thanks for creating this! It looks great.",
        userId: "user2",
        username: "CodingWizard",
        timestamp: Date.now() - 43200000,
        roomId: "general",
      },
      {
        id: "msg3",
        text: "I'm loving the real-time features and the design is sleek!",
        userId: "user4",
        username: "DesignMaster",
        timestamp: Date.now() - 3600000,
        roomId: "general",
      },
      {
        id: "msg4",
        text: "The automatic IDs and usernames are a nice touch.",
        userId: "user1",
        username: "TechGuru",
        timestamp: Date.now() - 1800000,
        roomId: "general",
      },
      {
        id: "msg5",
        text: "Let me know if anyone needs help with the chat features.",
        userId: "user2",
        username: "CodingWizard",
        timestamp: Date.now() - 900000,
        roomId: "general",
      },
    ];
    
    setMessages(mockMessages);

  }, []);

  // Send a new message
  const sendMessage = useCallback((text: string) => {
    if (!currentUser || !text.trim()) return;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      text,
      userId: currentUser.id,
      username: currentUser.username,
      timestamp: Date.now(),
      roomId: currentRoomId,
    };
    
    setMessages((prev) => [...prev, newMessage]);
  }, [currentUser, currentRoomId]);

  // Join a room
  const joinRoom = useCallback((roomId: string) => {
    setCurrentRoomId(roomId);
  }, []);

  // Update username
  const setUsername = useCallback((username: string) => {
    if (!currentUser || !username.trim()) return;
    
    const updatedUser = { ...currentUser, username };
    setCurrentUser(updatedUser);
    
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === currentUser.id ? updatedUser : user
      )
    );
  }, [currentUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        rooms,
        currentUser,
        currentRoomId,
        sendMessage,
        joinRoom,
        setUsername,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
