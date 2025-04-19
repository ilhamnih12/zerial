
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  username: string;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
}

const UserAvatar = ({ username, isOnline = false, size = "md" }: UserAvatarProps) => {
  // Get initials from username
  const getInitials = (name: string) => {
    if (!name) return "U";
    
    // For usernames with spaces (like "John Doe"), get initials of each part
    if (name.includes(" ")) {
      return name
        .split(" ")
        .map(part => part[0])
        .join("")
        .toUpperCase();
    }
    
    // For usernames without spaces but with mixed case (like "TechGuru")
    // Find capital letters or the first letter
    const capitals = name.match(/[A-Z]/g) || [];
    if (capitals.length >= 2) {
      return capitals.slice(0, 2).join("");
    }
    
    // Default: return first two characters
    return name.slice(0, 2).toUpperCase();
  };
  
  // Determine avatar size based on prop
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  
  // Generate a consistent color based on username
  const getColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ];
    
    // Simple hash function to get a consistent index
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]}`}>
        <AvatarFallback className={`${getColor(username)} text-white`}>
          {getInitials(username)}
        </AvatarFallback>
      </Avatar>
      
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
            isOnline ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      )}
    </div>
  );
};

export default UserAvatar;
