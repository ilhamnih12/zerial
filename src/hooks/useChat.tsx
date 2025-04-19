
import { useChat as useContextChat } from "@/context/ChatContext";

export function useChat() {
  return useContextChat();
}
