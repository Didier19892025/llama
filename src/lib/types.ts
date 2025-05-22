// /lib/types.ts

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'bot';
  content: string;
  created_at: string;
}

export interface Database {
  conversations: Conversation[];
  messages: Message[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  content: string;
}