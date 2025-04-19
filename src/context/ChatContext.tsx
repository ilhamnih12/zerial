
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
  CURRENT_USER: 'chat_current_user',
  LAST_UPDATE: 'chat_last_update'
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
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }

      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Initialize users array if it doesn't exist
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
      }

      // Initialize current user if not exists
      if (storedCurrentUser) {
        const parsedUser = JSON.parse(storedCurrentUser);
        setCurrentUser(parsedUser);
        
        // Update user's online status
        updateUserStatus(parsedUser.id, true);
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
        
        // Add user to users list
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      }
      
      // Set initial last updated timestamp
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, Date.now().toString());
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      // Update the last updated timestamp
      const timestamp = Date.now();
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp.toString());
      setLastUpdated(timestamp);
    } catch (error) {
      console.error("Error saving messages to localStorage:", error);
    }
  }, [messages]);

  // Save users to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      // Update the last updated timestamp
      const timestamp = Date.now();
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp.toString());
      setLastUpdated(timestamp);
    } catch (error) {
      console.error("Error saving users to localStorage:", error);
    }
  }, [users]);

  // Update user status
  const updateUserStatus = useCallback((userId: string, isOnline: boolean) => {
    setUsers(prevUsers => {
      const userExists = prevUsers.some(user => user.id === userId);
      
      if (!userExists && currentUser && currentUser.id === userId) {
        // If the user doesn't exist in the list but is the current user, add them
        return [...prevUsers, { ...currentUser, isOnline, lastActive: Date.now() }];
      }
      
      return prevUsers.map(user => 
        user.id === userId 
          ? { ...user, isOnline, lastActive: Date.now() } 
          : user
      );
    });
  }, [currentUser]);

  // Poll for changes in localStorage from other tabs/windows
  useEffect(() => {
    const pollInterval = 1000; // Poll every second
    
    const checkForUpdates = () => {
      try {
        const lastUpdateStr = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
        if (lastUpdateStr) {
          const lastUpdateTime = parseInt(lastUpdateStr, 10);
          
          // If the last update in localStorage is newer than our last known update
          if (lastUpdateTime > lastUpdated) {
            // Update messages
            const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
            if (storedMessages) {
              const parsedMessages = JSON.parse(storedMessages);
              setMessages(parsedMessages);
            }
            
            // Update users (only if current user exists to prevent overwriting)
            if (currentUser) {
              const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
              if (storedUsers) {
                const parsedUsers = JSON.parse(storedUsers);
                
                // Make sure our current user is in the list and marked as online
                const userExists = parsedUsers.some((u: User) => u.id === currentUser.id);
                if (userExists) {
                  setUsers(parsedUsers.map((u: User) => 
                    u.id === currentUser.id ? { ...u, isOnline: true, lastActive: Date.now() } : u
                  ));
                } else {
                  setUsers([...parsedUsers, { ...currentUser, isOnline: true, lastActive: Date.now() }]);
                }
              }
            }
            
            setLastUpdated(lastUpdateTime);
          }
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };
    
    // Set up polling interval
    const intervalId = setInterval(checkForUpdates, pollInterval);
    
    // Also listen for storage events as a backup
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.MESSAGES) {
        try {
          const newMessages = JSON.parse(event.newValue || '[]');
          setMessages(newMessages);
        } catch (error) {
          console.error("Error parsing messages from storage event:", error);
        }
      }
      if (event.key === STORAGE_KEYS.USERS && currentUser) {
        try {
          const newUsers = JSON.parse(event.newValue || '[]');
          
          // Ensure current user is in the list and marked as online
          const userExists = newUsers.some((u: User) => u.id === currentUser.id);
          if (userExists) {
            setUsers(newUsers.map((u: User) => 
              u.id === currentUser.id ? { ...u, isOnline: true, lastActive: Date.now() } : u
            ));
          } else {
            setUsers([...newUsers, { ...currentUser, isOnline: true, lastActive: Date.now() }]);
          }
        } catch (error) {
          console.error("Error parsing users from storage event:", error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Update user status on window focus/blur
    const handleFocus = () => {
      if (currentUser) {
        updateUserStatus(currentUser.id, true);
      }
    };
    
    const handleBlur = () => {
      if (currentUser) {
        updateUserStatus(currentUser.id, false);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Check for updates immediately
    checkForUpdates();
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      // Mark user as offline when component unmounts
      if (currentUser) {
        updateUserStatus(currentUser.id, false);
      }
    };
  }, [currentUser, lastUpdated, updateUserStatus]);

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
    
    // Force an update of the lastUpdated timestamp to trigger sync
    const timestamp = Date.now();
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp.toString());
    setLastUpdated(timestamp);
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
      const userIndex = prevUsers.findIndex(user => user.id === currentUser.id);
      
      if (userIndex >= 0) {
        // User exists in the list, update them
        const newUsers = [...prevUsers];
        newUsers[userIndex] = updatedUser;
        return newUsers;
      } else {
        // User doesn't exist in the list, add them
        return [...prevUsers, updatedUser];
      }
    });
    
    // Force an update of the lastUpdated timestamp to trigger sync
    const timestamp = Date.now();
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp.toString());
    setLastUpdated(timestamp);
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
