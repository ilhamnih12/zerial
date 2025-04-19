
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";

const MessageInput = () => {
  const { sendMessage } = useChat();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus the textarea on component mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage("");
      
      // Refocus the textarea after sending
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };
  
  // Handle keyboard shortcuts (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className="border-t p-3 bg-card">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-12 max-h-36 pr-12 resize-none py-3"
            rows={1}
          />
          <div className="absolute right-3 bottom-3 flex gap-1.5">
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full text-muted-foreground"
            >
              <Paperclip size={16} />
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full text-muted-foreground"
            >
              <Smile size={16} />
            </Button>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim()}
          className="h-10 w-10 rounded-full p-0 flex items-center justify-center bg-chat-primary hover:bg-chat-secondary"
        >
          <Send size={16} className="text-white" />
        </Button>
      </form>
      
      <div className="mt-1.5 px-1 text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

export default MessageInput;
