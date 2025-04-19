
import React, { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import UserAvatar from "./UserAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimestamp } from "@/lib/utils/chatUtils";

const MessageList = () => {
  const { messages, currentRoomId, currentUser } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Filter messages for the current room
  const roomMessages = messages.filter(
    (message) => message.roomId === currentRoomId
  );
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [roomMessages]);
  
  // Group messages by user and time
  const groupedMessages = roomMessages.reduce((acc, message, index) => {
    const previousMessage = roomMessages[index - 1];
    
    // Start a new group if:
    // 1. This is the first message
    // 2. Different user from previous message
    // 3. Time difference > 5 minutes from previous message
    const shouldStartNewGroup =
      !previousMessage ||
      previousMessage.userId !== message.userId ||
      message.timestamp - previousMessage.timestamp > 5 * 60 * 1000;
    
    if (shouldStartNewGroup) {
      acc.push([message]);
    } else {
      acc[acc.length - 1].push(message);
    }
    
    return acc;
  }, [] as Array<Array<typeof roomMessages[0]>>);
  
  // Get the day for a timestamp and format it
  const getMessageDay = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };
  
  // Check if we need to show a day separator
  const shouldShowDaySeparator = (
    currentIndex: number,
    currentTimestamp: number
  ) => {
    if (currentIndex === 0) return true;
    
    const previousGroup = groupedMessages[currentIndex - 1];
    const previousTimestamp = previousGroup[0].timestamp;
    
    const currentDate = new Date(currentTimestamp).setHours(0, 0, 0, 0);
    const previousDate = new Date(previousTimestamp).setHours(0, 0, 0, 0);
    
    return currentDate !== previousDate;
  };
  
  return (
    <ScrollArea className="h-full pb-4">
      <div className="flex flex-col gap-6 py-4 px-4">
        {groupedMessages.map((group, groupIndex) => (
          <React.Fragment key={group[0].id}>
            {/* Day separator */}
            {shouldShowDaySeparator(groupIndex, group[0].timestamp) && (
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="px-4 text-xs font-medium text-muted-foreground">
                  {getMessageDay(group[0].timestamp)}
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
            )}
            
            {/* Message group */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center mb-1">
                <UserAvatar 
                  username={group[0].username} 
                  isOnline={group[0].userId === currentUser?.id ? true : undefined} 
                  size="sm"
                />
                <div className="ml-2">
                  <span className="font-medium text-sm">
                    {group[0].username}
                    {group[0].userId === currentUser?.id && " (you)"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTimestamp(group[0].timestamp)}
                  </span>
                </div>
              </div>
              
              {group.map((message) => (
                <div 
                  key={message.id} 
                  className="pl-8 pr-4"
                >
                  <p className="text-sm leading-relaxed break-words">
                    {message.text}
                  </p>
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}
        
        {/* Element to scroll to */}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
