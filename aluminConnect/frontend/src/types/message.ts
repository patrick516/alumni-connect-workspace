export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface Conversation {
  user: {
    _id: string;
    name: string;
    profilePhoto?: string;
    role: string;
  };
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}
