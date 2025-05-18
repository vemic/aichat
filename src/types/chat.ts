export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
  isBookmarked: boolean; // お気に入りからブックマークに名称変更
  isShared: boolean;
  shareUrl?: string;
}

export interface ThreadShare {
  threadId: string;
  shareId: string;
  createdAt: number;
  expiresAt: number;
  url: string;
}