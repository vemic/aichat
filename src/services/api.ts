import config from 'config';
import { ChatThread, Message } from '../types/chat';

// モックデータインポート
import programmingChatData from '../mocks/data/programming_chat.json';
import excelDesignData from '../mocks/data/excel_design.json';
import companyPolicyData from '../mocks/data/company_policy.json';

// モックデータ配列
const mockThreads: ChatThread[] = [
  programmingChatData as ChatThread,
  excelDesignData as ChatThread,
  companyPolicyData as ChatThread
];

// モックサービス
const mockService = {
  // スレッド一覧取得
  getMockThreads: async (): Promise<ChatThread[]> => {
    return mockThreads;
  },
  
  // 特定のスレッド取得
  getMockThread: async (threadId: string): Promise<ChatThread | undefined> => {
    return mockThreads.find(thread => thread.id === threadId);
  },
  
  // メッセージ送信
  sendMessage: async (message: string, threadId?: string): Promise<Message> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `mock-${Date.now()}`,
          role: 'assistant',
          content: `モック応答: ${message}`,
          timestamp: Date.now(),
        });
      }, 500); // モック応答の遅延
    });
  },
  
  // 新規スレッド作成
  createThread: async (title: string): Promise<ChatThread> => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: title || '新しいチャット',
      messages: [],
      lastUpdated: Date.now(),
      isBookmarked: false,
      isShared: false
    };
    
    mockThreads.push(newThread);
    return newThread;
  },
  
  // スレッド更新
  updateThread: async (threadId: string, updates: Partial<ChatThread>): Promise<ChatThread | undefined> => {
    const threadIndex = mockThreads.findIndex(thread => thread.id === threadId);
    if (threadIndex === -1) return undefined;
    
    mockThreads[threadIndex] = {
      ...mockThreads[threadIndex],
      ...updates,
      lastUpdated: Date.now()
    };
    
    return mockThreads[threadIndex];
  },
  
  // レガシーモック履歴API（古いインタフェース互換性のため維持）
  getMockHistory: async () => {
    // 最初のスレッドのメッセージを変換して返す
    const thread = mockThreads[0];
    return thread.messages.map((msg, index) => ({
      id: String(index + 1),
      position: msg.role === 'user' ? 'right' : 'left',
      type: 'text',
      text: msg.content,
      date: new Date(msg.timestamp),
      title: '',
      focus: false,
      titleColor: '',
      forwarded: false,
      reply: null,
      notch: true,
      avatar: '',
      status: msg.role === 'user' ? 'received' : 'sent',
      replyButton: false,
      removeButton: false,
      retracted: false,
    }));
  },
  
  // メッセージ再生成
  regenerateMessage: async (threadId: string, messageId: string): Promise<Message> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `regenerated-${Date.now()}`,
          role: 'assistant',
          content: `再生成されたメッセージです。元のメッセージID: ${messageId}`,
          timestamp: Date.now(),
        });
      }, 800);
    });
  },
  
  // スレッド共有
  shareThread: async (threadId: string) => {
    const shareId = `share-${Math.random().toString(36).substring(2, 9)}`;
    return {
      threadId,
      shareId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1週間後
      url: `https://aichat.example.com/share/${shareId}`
    };
  }
};

// Azure AI Serviceとの接続
const azureService = {
  // スレッド一覧取得
  getMockThreads: async (): Promise<ChatThread[]> => {
    // 実際の実装ではAPIを呼び出す
    throw new Error('本番環境では未実装');
  },
  
  // 特定のスレッド取得
  getMockThread: async (threadId: string): Promise<ChatThread | undefined> => {
    // 実際の実装ではAPIを呼び出す
    throw new Error('本番環境では未実装');
  },
  
  // メッセージ送信
  sendMessage: async (message: string, threadId?: string) => {
    const response = await fetch(`${config.apiEndpoint}?api-version=${config.apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: message },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Azure AI Serviceリクエストに失敗しました');
    }

    const data = await response.json();
    return {
      id: data.id,
      role: 'assistant',
      content: data.choices[0].message.content,
      timestamp: Date.now(),
    };
  },
  
  // 新規スレッド作成
  createThread: async (title: string): Promise<ChatThread> => {
    // 実際の実装ではAPIを呼び出す
    throw new Error('本番環境では未実装');
  },
  
  // スレッド更新
  updateThread: async (threadId: string, updates: Partial<ChatThread>): Promise<ChatThread | undefined> => {
    // 実際の実装ではAPIを呼び出す
    throw new Error('本番環境では未実装');
  },
  
  // メッセージ再生成
  regenerateMessage: async (threadId: string, messageId: string): Promise<Message> => {
    // 実際の実装ではAPIを呼び出す
    throw new Error('本番環境では未実装');
  },
  
  // スレッド共有
  shareThread: async (threadId: string) => {
    // 実際の実装ではAPIを呼び出す
    throw new Error('本番環境では未実装');
  },
  
  // 互換性のため
  getMockHistory: async () => {
    throw new Error('本番環境では未実装');
  }
};

// サービスをエクスポート
const service = config.mockMode ? mockService : azureService;
export default service;