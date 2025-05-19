import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, ChatThread, ThreadShare } from '../types/chat';
import api from '../services/api';

// APIの型を拡張して getMockHistory を使用できるようにする
const getMockHistory = (api as any).getMockHistory;

interface ChatContextType {
  threads: ChatThread[];
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  createThread: (title?: string) => Promise<string>;
  addMessage: (threadId: string, message: Message) => void;
  toggleBookmark: (threadId: string) => void; // お気に入り→ブックマークに名称変更
  shareThread: (threadId: string) => Promise<ThreadShare>;
  regenerateMessage: (threadId: string, messageId: string) => Promise<void>;
  exportThreadsToJSON: (threadIds?: string[]) => Promise<string>; // JSON形式でエクスポート
  exportThreadToMarkdown: (threadId: string) => Promise<string>; // Markdown形式でエクスポート
  exportThreadToPDF: (threadId: string) => Promise<Blob>; // PDF形式でエクスポート
  exportThreadToWord: (threadId: string) => Promise<Blob>; // Word形式でエクスポート
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);  // 初期化時にモックデータを読み込む
  useEffect(() => {
    const loadMockData = async () => {
      try {
        // 新しいモックAPIを使用（すべてのスレッドをJSONから読み込む）
        if (api.getMockThreads) {
          const mockThreads = await api.getMockThreads();
          if (mockThreads && mockThreads.length > 0) {
            setThreads(mockThreads);
            // 最初のスレッドをアクティブに設定
            setActiveThreadId(mockThreads[0].id);
            return;
          }
        }
        
        // フォールバック: 古いメソッドを使用
        if (getMockHistory) {
          try {
            const mockHistory = await getMockHistory();
            
            if (mockHistory && Array.isArray(mockHistory) && mockHistory.length > 0) {
              // モックデータから最初のスレッドを作成
              const mockMessages: Message[] = mockHistory.map((msg: any) => ({
                id: msg.id,
                role: msg.position === 'right' ? 'user' : 'assistant',
                content: msg.text || '空のメッセージ',
                timestamp: msg.date ? new Date(msg.date).getTime() : Date.now(),
              }));
              
              const mockThreadId = 'thread-' + Date.now();
              const mockThread: ChatThread = {
                id: mockThreadId,
                title: mockMessages[0]?.content?.substring(0, 30) + '...' || '新しいチャット',
                messages: mockMessages,
                lastUpdated: Date.now(),
                isBookmarked: false,
                isShared: false
              };
              
              setThreads([mockThread]);
              setActiveThreadId(mockThreadId);
            }
          } catch (error) {
            console.error('getMockHistory実行中にエラーが発生しました:', error);
          }
        }
      } catch (error) {
        console.error('モックデータの読み込みに失敗しました:', error);
      }
    };
    
    loadMockData();
  }, []);
  // 新しいスレッドを作成
  const createThread = async (title?: string): Promise<string> => {
    try {
      if (api.createThread) {
        // APIを使用して新しいスレッドを作成
        const newThread = await api.createThread(title || '新しいチャット');
        setThreads(prev => [...prev, newThread]);
        setActiveThreadId(newThread.id);
        return newThread.id;
      } else {
        // フォールバック: ローカルで作成
        const newThreadId = 'thread-' + Date.now();
        const newThread: ChatThread = {
          id: newThreadId,
          title: title || '新しいチャット',
          messages: [],
          lastUpdated: Date.now(),
          isBookmarked: false,
          isShared: false
        };
        
        setThreads(prev => [...prev, newThread]);
        setActiveThreadId(newThreadId);
        return newThreadId;
      }
    } catch (error) {
      console.error('スレッド作成エラー:', error);
      // エラー時はローカルで作成
      const newThreadId = 'thread-' + Date.now();
      const newThread: ChatThread = {
        id: newThreadId,
        title: title || '新しいチャット',
        messages: [],
        lastUpdated: Date.now(),
        isBookmarked: false,
        isShared: false
      };
      
      setThreads(prev => [...prev, newThread]);
      setActiveThreadId(newThreadId);
      return newThreadId;
    }
  };

  // スレッドにメッセージを追加
  const addMessage = (threadId: string, message: Message) => {
    setThreads(prevThreads => 
      prevThreads.map(thread => {
        if (thread.id === threadId) {
          // スレッド内の最初のメッセージの場合、スレッドタイトルを設定
          let updatedTitle = thread.title;
          if (thread.messages.length === 0 && message.role === 'user') {
            updatedTitle = message.content.length > 30 
              ? message.content.substring(0, 30) + '...' 
              : message.content;
          }
          
          return {
            ...thread,
            title: updatedTitle,
            messages: [...thread.messages, message],
            lastUpdated: Date.now()
          };
        }
        return thread;
      })
    );
  };
  // ブックマーク切り替え
  const toggleBookmark = (threadId: string) => {
    setThreads(prevThreads => 
      prevThreads.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            isBookmarked: !thread.isBookmarked
          };
        }
        return thread;
      })
    );
  };
  // スレッド共有
  const shareThread = async (threadId: string): Promise<ThreadShare> => {
    try {
      // APIを使用してスレッドを共有
      const shareData = await api.shareThread(threadId);
      
      // スレッドを共有状態に更新
      setThreads(prevThreads => 
        prevThreads.map(thread => {
          if (thread.id === threadId) {
            return {
              ...thread,
              isShared: true,
              shareUrl: shareData.url
            };
          }
          return thread;
        })
      );
      
      return shareData;
    } catch (error) {
      console.error('スレッド共有エラー:', error);
      // エラー時のフォールバック
      const shareId = `share-${Math.random().toString(36).substring(2, 9)}`;
      const fallbackShareData: ThreadShare = {
        threadId,
        shareId,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1週間後
        url: `https://aichat.example.com/share/${shareId}`
      };
      
      setThreads(prevThreads => 
        prevThreads.map(thread => {
          if (thread.id === threadId) {
            return {
              ...thread,
              isShared: true,
              shareUrl: fallbackShareData.url
            };
          }
          return thread;
        })
      );
      
      return fallbackShareData;
    }
  };
  // メッセージ再生成
  const regenerateMessage = async (threadId: string, messageId: string): Promise<void> => {
    // 現在のスレッドとメッセージを取得
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;
    
    // メッセージ配列で対象メッセージの位置を特定
    const messageIndex = thread.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // 対象メッセージとその直前のメッセージを取得
    const targetMessage = thread.messages[messageIndex];
    
    try {
      let newMessage: Message;
      
      if (targetMessage.role === 'user') {
        // ユーザーメッセージの場合、新しいAI応答を生成
        const response = await api.sendMessage(targetMessage.content, threadId);
        newMessage = {
          id: `regenerated-${Date.now()}`,
          role: 'assistant',
          content: response.content,
          timestamp: Date.now()
        };
      } else {
        // AI応答メッセージを再生成
        const prevUserMessage = messageIndex > 0 ? thread.messages[messageIndex - 1] : null;
        
        // 前のユーザーメッセージがあればそれを使用、なければ空文字
        const userContent = prevUserMessage && prevUserMessage.role === 'user' 
          ? prevUserMessage.content 
          : 'コンテキストなし';
          
        // APIのregenrateMessageを使用
        if (api.regenerateMessage) {
          newMessage = await api.regenerateMessage(threadId, messageId);
        } else {
          // フォールバック: 通常のsendMessageを使用
          const response = await api.sendMessage(userContent, threadId);
          newMessage = {
            id: `regenerated-${Date.now()}`,
            role: 'assistant',
            content: response.content,
            timestamp: Date.now()
          };
        }
      }
      
      // スレッドを更新
      setThreads(prevThreads => 
        prevThreads.map(t => {
          if (t.id === threadId) {
            const updatedMessages = [...t.messages];
            
            if (targetMessage.role === 'user') {
              // ユーザーメッセージの後に回答を追加/置換
              if (messageIndex + 1 < updatedMessages.length && updatedMessages[messageIndex + 1].role === 'assistant') {
                updatedMessages[messageIndex + 1] = newMessage;
              } else {
                updatedMessages.push(newMessage);
              }
            } else {
              // AI応答そのものを置き換え
              updatedMessages[messageIndex] = newMessage;
            }
            
            return {
              ...t,
              messages: updatedMessages,
              lastUpdated: Date.now()
            };
          }
          return t;
        })
      );    } catch (error) {
      console.error('メッセージの再生成に失敗しました:', error);
      throw error;
    }
  };
  // スレッドをJSONとしてエクスポート
  const exportThreadsToJSON = async (threadIds?: string[]): Promise<string> => {
    // 特定のスレッドのみエクスポートするか、全てのスレッドをエクスポートするか
    const threadsToExport = threadIds 
      ? threads.filter(thread => threadIds.includes(thread.id)) 
      : threads;
    
    // JSONとしてエクスポート
    const exportData = {
      threads: threadsToExport,
      exportedAt: new Date().toISOString(),
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  // スレッドをMarkdownとしてエクスポート
  const exportThreadToMarkdown = async (threadId: string): Promise<string> => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return '';
    
    const title = `# ${thread.title}\n\n`;
    const exportDate = `*${new Date().toLocaleString()}*\n\n`;
    
    // メッセージをMarkdown形式に変換
    const messages = thread.messages.map(msg => {
      const role = msg.role === 'user' ? '**ユーザー**' : '**AI**';
      const timestamp = new Date(msg.timestamp).toLocaleString();
      return `## ${role} (${timestamp})\n\n${msg.content}\n\n`;
    }).join('---\n\n');
    
    return title + exportDate + messages;
  };
  
  // スレッドをPDF形式でエクスポート
  const exportThreadToPDF = async (threadId: string): Promise<Blob> => {
    // PDF生成のためのモックデータ
    // 実際の実装ではpdfmake等のライブラリを使用する想定
    const markdown = await exportThreadToMarkdown(threadId);
    
    // PDFのモック実装（実際には適切なライブラリを使う）
    const pdfBlob = new Blob([markdown], { type: 'application/pdf' });
    
    return pdfBlob;
  };
  
  // スレッドをWord形式でエクスポート
  const exportThreadToWord = async (threadId: string): Promise<Blob> => {
    // Word生成のためのモックデータ
    // 実際の実装ではdocx等のライブラリを使用する想定
    const markdown = await exportThreadToMarkdown(threadId);
    
    // Wordのモック実装（実際には適切なライブラリを使う）
    const wordBlob = new Blob([markdown], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    return wordBlob;
  };

  return (
    <ChatContext.Provider value={{
      threads,
      activeThreadId,
      setActiveThreadId,
      createThread,
      addMessage,
      toggleBookmark,
      shareThread,
      regenerateMessage,
      exportThreadsToJSON,
      exportThreadToMarkdown,
      exportThreadToPDF,
      exportThreadToWord
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
