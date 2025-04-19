import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, push } from "firebase/database";
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
    
    const newUser: User = {
      id: userId,
      username,
      isOnline: true,
      lastActive: Date.now(),
    };
    
    setCurrentUser(newUser);
    
    // Save user to Firebase
    set(ref(db, `users/${userId}`), newUser);
    
    // Cleanup on unmount
    return () => {
      if (userId) {
        set(ref(db, `users/${userId}/isOnline`), false);
      }
    };
  }, []);

  // Listen to messages
  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageArray = Object.values(data) as Message[];
        setMessages(messageArray.sort((a, b) => a.timestamp - b.timestamp));
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to users
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userArray = Object.values(data) as User[];
        setUsers(userArray);
      }
    });

    return () => unsubscribe();
  }, []);

  // Send message function
  const sendMessage = async (text: string) => {
    if (!currentUser || !text.trim()) return;
    
    const messagesRef = ref(db, 'messages');
    const newMessage: Message = {
      id: `msg_${Date.now()}_${currentUser.id}`,
      text,
      userId: currentUser.id,
      username: currentUser.username,
      timestamp: Date.now(),
      roomId: currentRoomId,
    };
    
    await push(messagesRef, newMessage);
  };

  // Join room function
  const joinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
  };

  // Set username function
  const setUsername = async (username: string) => {
    if (!currentUser || !username.trim()) return;
    
    const updatedUser = {
      ...currentUser,
      username,
    };
    
    setCurrentUser(updatedUser);
    await set(ref(db, `users/${currentUser.id}`), updatedUser);
  };

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
