
import React, { useState } from "react";
import { useChat } from "@/hooks/useChat";
import UserAvatar from "./UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  MessageSquare, 
  Menu, 
  X,
  LogOut,
  Settings,
  Edit
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const Sidebar = () => {
  const { users, rooms, currentUser, currentRoomId, joinRoom, setUsername } = useChat();
  const [isOpen, setIsOpen] = useState(true);
  const [view, setView] = useState<"rooms" | "users">("rooms");
  const [newUsername, setNewUsername] = useState("");
  
  // Filter online and offline users
  const onlineUsers = users.filter((user) => user.isOnline);
  const offlineUsers = users.filter((user) => !user.isOnline);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const handleChangeUsername = () => {
    if (newUsername.trim()) {
      setUsername(newUsername.trim());
      setNewUsername("");
    }
  };
  
  return (
    <>
      {/* Mobile menu toggle */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar}
          className="h-10 w-10 rounded-full bg-background shadow-md"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 z-20 h-full ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transform transition-transform duration-300 ease-in-out md:translate-x-0 md:transition-none`}
      >
        <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold">Chat Verse</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="h-8 w-8 md:hidden text-sidebar-foreground"
            >
              <X size={16} />
            </Button>
          </div>
          
          {/* Current user */}
          {currentUser && (
            <div className="bg-sidebar-accent p-4">
              <div className="flex items-center space-x-3">
                <UserAvatar username={currentUser.username} isOnline={true} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium">{currentUser.username}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit size={14} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Username</DialogTitle>
                          <DialogDescription>
                            Enter a new username below.
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="New username"
                          className="mt-4"
                        />
                        <DialogFooter className="mt-4">
                          <Button onClick={handleChangeUsername}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    ID: {currentUser.id.substring(0, 8)}...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation tabs */}
          <div className="flex border-b border-sidebar-border">
            <button
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
                view === "rooms" ? "text-sidebar-foreground" : "text-sidebar-foreground/60"
              }`}
              onClick={() => setView("rooms")}
            >
              <MessageSquare size={16} />
              <span>Rooms</span>
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
                view === "users" ? "text-sidebar-foreground" : "text-sidebar-foreground/60"
              }`}
              onClick={() => setView("users")}
            >
              <Users size={16} />
              <span>Users</span>
            </button>
          </div>
          
          {/* Content based on selected view */}
          <ScrollArea className="flex-1">
            {view === "rooms" && (
              <div className="p-3">
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-sidebar-foreground/70">
                  Chat Rooms
                </h3>
                <div className="space-y-1">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      className={`w-full rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent ${
                        currentRoomId === room.id
                          ? "bg-sidebar-accent font-medium"
                          : "text-sidebar-foreground/90"
                      }`}
                      onClick={() => joinRoom(room.id)}
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-xl">#</span>
                        <div>
                          <div>{room.name}</div>
                          {room.description && (
                            <p className="text-xs text-sidebar-foreground/60 truncate">
                              {room.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {view === "users" && (
              <div className="p-3">
                {onlineUsers.length > 0 && (
                  <>
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-sidebar-foreground/70">
                      Online — {onlineUsers.length}
                    </h3>
                    <div className="space-y-1">
                      {onlineUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center rounded-md px-2 py-2 hover:bg-sidebar-accent"
                        >
                          <UserAvatar username={user.username} isOnline={true} size="sm" />
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.username} {user.id === currentUser?.id && "(you)"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {offlineUsers.length > 0 && (
                  <>
                    <h3 className="mb-2 mt-4 px-2 text-xs font-semibold uppercase text-sidebar-foreground/70">
                      Offline — {offlineUsers.length}
                    </h3>
                    <div className="space-y-1">
                      {offlineUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center rounded-md px-2 py-2 text-sidebar-foreground/60 hover:bg-sidebar-accent"
                        >
                          <UserAvatar username={user.username} isOnline={false} size="sm" />
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.username}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
          
          {/* Footer */}
          <div className="border-t border-sidebar-border p-3">
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                <Settings size={16} />
              </Button>
              <Button variant="ghost" size="sm" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black/30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
