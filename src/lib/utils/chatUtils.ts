import { v4 as uuidv4 } from 'uuid';

const adjectives = [
  "Happy", "Brave", "Clever", "Gentle", "Lucky", "Mighty", "Noble", "Swift", "Calm", "Wise",
  "Bold", "Eager", "Grand", "Jolly", "Kind", "Lively", "Proud", "Smart", "Tough", "Witty"
];

const nouns = [
  "Tiger", "Eagle", "Panda", "Wolf", "Shark", "Lion", "Bear", "Hawk", "Whale", "Fox",
  "Dragon", "Falcon", "Phoenix", "Cobra", "Dolphin", "Jaguar", "Raven", "Panther", "Owl", "Lynx"
];

/**
 * Generate a unique user ID
 */
export const generateUserId = (): string => {
  return uuidv4();
};

/**
 * Generate a random username from combinations of adjectives and nouns
 */
export const generateUsername = (): string => {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

/**
 * Format a timestamp to a readable format
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If the message is from today, just show the time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If the message is from yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Otherwise, show the full date
  return date.toLocaleDateString([], { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get time since the timestamp in a human-readable format
 */
export const getTimeSince = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  
  if (seconds < 10) {
    return "just now";
  }
  
  return Math.floor(seconds) + " seconds ago";
};
