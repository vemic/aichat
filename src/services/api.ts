import { config } from '../config';
import { ChatThread, Message } from '../types/chat';

// LocalStorageのキー
const STORAGE_KEY = 'aichat_mock_threads';

// スレッドデータを動的にロードする関数
async function loadThreadDataAsync(): Promise<ChatThread[]> {
  const threadData: ChatThread[] = [];

  try {
    console.log('公開ディレクトリからのスレッドデータロードを開始します...');
    
    // 1. 公開ディレクトリから利用可能なスレッドのインデックスを取得
    let threadFilenames: string[] = [];
    let indexLoaded = false;
    
    // インデックスファイルを読み込む試行回数を増やす
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!indexLoaded && retryCount < maxRetries) {
      try {
        console.log(`スレッドインデックスの読み込みを試行中... (${retryCount + 1}/${maxRetries})`);
        const indexResponse = await fetch('/mocks/data/threads-index.json', { 
          cache: 'no-store',  // キャッシュを使わない
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (indexResponse.ok) {
          const indexData = await indexResponse.json();
          threadFilenames = indexData.files || [];
          console.log('公開ディレクトリからスレッドインデックスを読み込みました', threadFilenames);
          indexLoaded = true;        } else {
          console.warn(`スレッドインデックスの読み込みに失敗: HTTP ${indexResponse.status}`);
          const currentRetry = retryCount;
          retryCount++;
          // 少し待機してから再試行
          if (currentRetry < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 300 * currentRetry));
          }
        }      } catch (e) {
        console.warn('スレッドインデックスの読み込み中にエラー:', e);
        const currentRetry = retryCount;
        retryCount++;
        // 少し待機してから再試行
        if (currentRetry < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 300 * currentRetry));
        }
      }
    }

    // 2. スレッドファイルが見つかった場合、それぞれを読み込む
    if (threadFilenames.length > 0) {
      const loadPromises = threadFilenames.map(async (filename) => {
        try {
          console.log(`スレッドファイル ${filename} の読み込みを試行中...`);
          const response = await fetch(`/mocks/data/${filename}`, { 
            cache: 'no-store',  // キャッシュを使わない
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          if (response.ok) {
            const module = await response.json();
            if (module && module.id && module.title && Array.isArray(module.messages)) {
              return module as ChatThread;
            } else {
              console.warn(`Invalid thread data format in file ${filename}:`, module);
              return null;
            }
          } else {
            console.warn(`スレッドファイル ${filename} の取得に失敗: HTTP ${response.status}`);
            return null;
          }
        } catch (e) {
          console.warn(`スレッドファイル ${filename} の読み込みに失敗:`, e);
          return null;
        }
      });
      
      // 並列でファイルを読み込む
      const loadResults = await Promise.all(loadPromises);
      const validThreads = loadResults.filter(thread => thread !== null) as ChatThread[];
      threadData.push(...validThreads);
    }

    // 3. 公開ディレクトリからデータが取得できた場合はそれを使用
    if (threadData.length > 0) {
      console.log('公開ディレクトリから', threadData.length, '個のスレッドデータを読み込みました');
      return threadData;
    }
    
    // 4. 公開ディレクトリからデータが取得できなかった場合はビルトインデータを使用
    console.log('公開ディレクトリからデータが読み込めなかったため、ビルトインデータを使用します');
  } catch (e) {
    console.warn('公開ディレクトリからのデータ読み込みに失敗しました:', e);
  }

  // フォールバック: ビルドインの静的インポート
  return loadBuildInThreadData();
}

// ビルドに含まれるスレッドデータを同期的に読み込む関数
function loadBuildInThreadData(): ChatThread[] {
  const threadData: ChatThread[] = [];

  // TypeScriptで動的インポートを処理するためのインターフェース
  interface WebpackContext {
    keys(): string[];
    (id: string): any;
  }

  // TypeScriptのエラーを回避するためのダミーオブジェクト宣言
  // @ts-ignore
  function importAll(r: WebpackContext): any[] {
    return r.keys().map(r);
  }

  try {
    // @ts-ignore - Webpackによる動的インポート
    const context = require.context('../mocks/data', false, /^\.\/thread-.*\.json$/);
    const modules = importAll(context);

    // それぞれのモジュールを検証してスレッドデータとして追加
    modules.forEach((module, index) => {
      if (module && module.id && module.title && Array.isArray(module.messages)) {
        threadData.push(module as ChatThread);
      } else {
        console.warn(`Invalid thread data format in module ${index}:`, module);
      }
    });
  } catch (e) {
    // フォールバック: 個別の静的インポート
    console.warn('Dynamic import failed, using static imports instead:', e);
    const threadModules = [
      require('../mocks/data/thread-aws-lambda-memory.json'),
      require('../mocks/data/thread-project-risk-consult.json'),
      require('../mocks/data/thread-customer-additional-request.json'),
      require('../mocks/data/thread-telework-attendance.json'),
      require('../mocks/data/thread-rpa-tool-selection.json'),
      require('../mocks/data/thread-db-performance-tuning.json'),
      require('../mocks/data/thread-security-incident-response.json'),
      require('../mocks/data/thread-agile-development-basics.json'),
      require('../mocks/data/thread-docker-container-error.json'),
      require('../mocks/data/thread-new-js-framework-learning.json')
    ];

    // スレッドモジュールをChatThread型として追加
    threadModules.forEach(module => {
      if (module && module.id && module.title && Array.isArray(module.messages)) {
        threadData.push(module as ChatThread);
      } else {
        console.warn('Invalid thread data format:', module);
      }
    });
  }

  return threadData;
}

// 同期的な互換性関数（従来のコードとの互換性のため）
function loadThreadData(): ChatThread[] {
  return loadBuildInThreadData();
}

// LocalStorageからスレッドデータを読み込む関数
function loadThreadsFromStorage(): ChatThread[] | null {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData) as ChatThread[];
      // 簡易的な検証を行う
      if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].id) {
        console.log('スレッドデータをLocalStorageから読み込みました');
        return parsedData;
      }
    }
  } catch (error) {
    console.error('LocalStorageからの読み込みに失敗しました:', error);
  }
  return null;
}

// LocalStorageにスレッドデータを保存する関数
function saveThreadsToStorage(threads: ChatThread[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    console.log('スレッドデータをLocalStorageに保存しました');
  } catch (error) {
    console.error('LocalStorageへの保存に失敗しました:', error);
  }
}

// モックデータ配列の初期値を空配列で用意
let mockThreads: ChatThread[] = [];

// モックデータを非同期的に初期化する関数
async function initializeMockThreads(): Promise<void> {
  console.log('モックスレッドデータの初期化を開始します...');
  // ブラウザ環境でのみLocalStorageを使用
  if (typeof window !== 'undefined' && window.localStorage) {
    // 1. まずLocalStorageからデータを読み込む（最優先）
    const storedThreads = loadThreadsFromStorage();
    if (storedThreads && storedThreads.length > 0) {
      mockThreads = storedThreads;
      console.log('LocalStorageから', mockThreads.length, '個のスレッドデータを読み込みました');
      return;
    }
    
    try {
      // 2. LocalStorageにデータがなければ公開ディレクトリから非同期に読み込む
      console.log('公開ディレクトリからスレッドデータの読み込みを試みます...');
      const threads = await loadThreadDataAsync();
      if (threads && threads.length > 0) {
        mockThreads = threads;
        console.log('外部ソースから', mockThreads.length, '個のスレッドデータを読み込みました');
        
        // 3. 読み込んだデータをLocalStorageに保存
        saveThreadsToStorage(mockThreads);
        return;
      } else {
        console.warn('外部ソースからスレッドデータを読み込みましたが、有効なデータがありませんでした');
      }
    } catch (e) {
      console.warn('外部データ読み込みに失敗しました:', e);
    }
  }
  
  // 4. 上記の方法が全て失敗した場合は、ビルドインのデータを使用
  console.log('ビルトインデータからの読み込みを試みます...');
  const builtInData = loadThreadData();
  if (builtInData && builtInData.length > 0) {
    mockThreads = builtInData;
    console.log('ビルトインソースから', mockThreads.length, '個のスレッドデータを読み込みました');
    
    // ブラウザ環境であればこのデータもLocalStorageに保存
    if (typeof window !== 'undefined' && window.localStorage) {
      saveThreadsToStorage(mockThreads);
    }
    return;
  }
  
  console.warn('すべてのデータソースからの読み込みが失敗しました。データがありません。');
}

// アプリケーション起動時にデータを初期化
initializeMockThreads().catch(e => {
  console.error('モックデータの初期化に失敗しました:', e);
  // フォールバック: ビルドインデータを使用
  mockThreads = loadThreadData();
});

// モックサービス
const mockService = {  // スレッド一覧取得
  getMockThreads: async (): Promise<ChatThread[]> => {
    // データがまだ読み込まれていない場合は初期化を待機
    if (mockThreads.length === 0) {
      console.log('スレッドデータがまだ読み込まれていません。初期化を待機します...');
      // 初期化を再度実行して待機
      try {
        await initializeMockThreads();
      } catch (e) {
        console.error('モックデータの初期化中にエラーが発生しました:', e);
        // それでも読み込めない場合はビルトインデータを使用
        mockThreads = loadThreadData();
      }
      
      // それでもデータがない場合は、サンプルのスレッドを作成
      if (mockThreads.length === 0) {
        console.warn('モックスレッドがありません。サンプルスレッドを作成します');
        const sampleThread: ChatThread = {
          id: `thread-${Date.now()}`,
          title: 'サンプルチャット',
          messages: [{
            id: '1',
            role: 'assistant',
            content: 'こんにちは！何かお手伝いできることはありますか？',
            timestamp: Date.now()
          }],
          lastUpdated: Date.now(),
          isBookmarked: false,
          isShared: false
        };
        mockThreads = [sampleThread];
      }
    }
    
    console.log('スレッドデータを返します:', mockThreads.length, '件');
    return mockThreads;
  },

  // 特定のスレッド取得
  getMockThread: async (threadId: string): Promise<ChatThread | undefined> => {
    // データがまだ読み込まれていない場合は初期化が完了するまで少し待機
    if (mockThreads.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return mockThreads.find(thread => thread.id === threadId);
  },// メッセージ送信
  sendMessage: async (message: string, threadId?: string): Promise<Message> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responseMessage: Message = {
          id: `mock-${Date.now()}`,
          role: 'assistant',
          content: `モック応答: ${message}`,
          timestamp: Date.now(),
        };
        
        // threadIdが指定されている場合は、そのスレッドにメッセージを追加
        if (threadId) {
          const threadIndex = mockThreads.findIndex(thread => thread.id === threadId);
          if (threadIndex !== -1) {
            // ユーザーメッセージとレスポンスを追加
            const userMessage: Message = {
              id: `user-${Date.now()}`,
              role: 'user',
              content: message,
              timestamp: Date.now() - 500, // ユーザーメッセージはレスポンスより少し前
            };
            
            mockThreads[threadIndex].messages.push(userMessage, responseMessage);
            mockThreads[threadIndex].lastUpdated = Date.now();
            
            // LocalStorageに更新を反映
            if (typeof window !== 'undefined' && window.localStorage) {
              saveThreadsToStorage(mockThreads);
            }
          }
        }
        
        resolve(responseMessage);
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
    
    // LocalStorageに更新を反映
    if (typeof window !== 'undefined' && window.localStorage) {
      saveThreadsToStorage(mockThreads);
    }
    
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
    
    // LocalStorageに更新を反映
    if (typeof window !== 'undefined' && window.localStorage) {
      saveThreadsToStorage(mockThreads);
    }

    return mockThreads[threadIndex];
  },
  // レガシーモック履歴API（古いインタフェース互換性のため維持）
  getMockHistory: async () => {
    // データが初期化されていない場合は初期化を試みる
    if (mockThreads.length === 0) {
      console.log('getMockHistory: スレッドがないため初期化を試みます...');
      try {
        await initializeMockThreads();
      } catch (e) {
        console.error('getMockHistory: モックデータの初期化中にエラーが発生しました:', e);
        mockThreads = loadThreadData();
      }
        // それでもスレッドがない場合はサンプルスレッドを返す
      if (mockThreads.length === 0) {
        console.warn('getMockHistory: モックスレッドを作成します');
        const sampleThread: ChatThread = {
          id: `thread-${Date.now()}`,
          title: 'サンプルチャット',
          messages: [{
            id: '1',
            role: 'assistant',
            content: 'こんにちは！何かお手伝いできることはありますか？',
            timestamp: Date.now()
          }],
          lastUpdated: Date.now(),
          isBookmarked: false,
          isShared: false
        };
        mockThreads = [sampleThread];
      }
    }
    
    // 最初のスレッドのメッセージを変換して返す
    const thread = mockThreads[0];
    if (!thread || !thread.messages) {
      console.error('getMockHistory: スレッドまたはメッセージが undefined です');
      // 空の配列を返す
      return [];
    }
    
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
        const regeneratedMessage: Message = {
          id: `regenerated-${Date.now()}`,
          role: 'assistant',
          content: `再生成されたメッセージです。元のメッセージID: ${messageId}`,
          timestamp: Date.now(),
        };
        
        // 対象のスレッドを特定し、メッセージを置き換え
        const threadIndex = mockThreads.findIndex(thread => thread.id === threadId);
        if (threadIndex !== -1) {
          const messageIndex = mockThreads[threadIndex].messages.findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1 && mockThreads[threadIndex].messages[messageIndex].role === 'assistant') {
            mockThreads[threadIndex].messages[messageIndex] = regeneratedMessage;
            mockThreads[threadIndex].lastUpdated = Date.now();
            
            // LocalStorageに更新を反映
            if (typeof window !== 'undefined' && window.localStorage) {
              saveThreadsToStorage(mockThreads);
            }
          }
        }
        
        resolve(regeneratedMessage);
      }, 800);
    });
  },
  // スレッド共有
  shareThread: async (threadId: string) => {
    const shareId = `share-${Math.random().toString(36).substring(2, 9)}`;
    const shareInfo = {
      threadId,
      shareId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1週間後
      url: `https://aichat.example.com/share/${shareId}`
    };
    
    // 対象のスレッドを特定し、共有状態を更新
    const threadIndex = mockThreads.findIndex(thread => thread.id === threadId);
    if (threadIndex !== -1) {
      mockThreads[threadIndex].isShared = true;
      mockThreads[threadIndex].shareUrl = shareInfo.url;
      mockThreads[threadIndex].lastUpdated = Date.now();
      
      // LocalStorageに更新を反映
      if (typeof window !== 'undefined' && window.localStorage) {
        saveThreadsToStorage(mockThreads);
      }
    }
    
    return shareInfo;
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