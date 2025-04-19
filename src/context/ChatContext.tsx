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

// Storage keys
const STORAGE_KEYS = {
  MESSAGES: 'chat_messages',
  USERS: 'chat_users',
  CURRENT_USER: 'chat_current_user'
};

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

  // Load data from localStorage on initial mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    // Initialize current user if not exists
    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    } else {
      const userId = generateUserId();
      const username = generateUsername();
      
      const newUser: User = {
        id: userId,
        username,
        isOnline: true,
        lastActive: Date.now(),
      };
      
      setCurrentUser(newUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.MESSAGES) {
        const newMessages = JSON.parse(event.newValue || '[]');
        setMessages(newMessages);
      }
      if (event.key === STORAGE_KEYS.USERS) {
        const newUsers = JSON.parse(event.newValue || '[]');
        setUsers(newUsers);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Send a new message
  const sendMessage = useCallback((text: string) => {
    if (!currentUser || !text.trim()) return;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}_${currentUser.id}`,
      text,
      userId: currentUser.id,
      username: currentUser.username,
      timestamp: Date.now(),
      roomId: currentRoomId,
    };
    
    setMessages(prev => [...prev, newMessage]);
    // Messages will be automatically saved to localStorage via useEffect
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
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => 
        user.id === currentUser.id ? updatedUser : user
      );
      return newUsers;
    });
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
