import config from 'config'; // 設定ファイルを正しいパスでインポート

// モックサービス
const mockService = {
  sendMessage: async (message: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'mock-id',
          role: 'assistant',
          content: `モック応答: ${message}`,
          timestamp: Date.now(),
        });
      }, 500); // モック応答の遅延
    });
  },
  // モック履歴API（エンジニア向けサンプルコードを含む）
  getMockHistory: async () => {
    return [
      {
        id: '1',
        position: 'right',
        type: 'text',
        text: 'PythonでHello Worldのサンプルコードを教えて',
        date: new Date(),
        title: '',
        focus: false,
        titleColor: '',
        forwarded: false,
        reply: null,
        notch: true,
        avatar: '',
        status: 'received',
        replyButton: false,
        removeButton: false,
        retracted: false,
      },
      {
        id: '2',
        position: 'left',
        type: 'text',
        text: 'こちらがPythonのHello Worldサンプルです:\n```python\nprint("Hello, World!")\n```',
        date: new Date(),
        title: '',
        focus: false,
        titleColor: '',
        forwarded: false,
        reply: null,
        notch: true,
        avatar: '',
        status: 'sent',
        replyButton: false,
        removeButton: false,
        retracted: false,
      },
      {
        id: '3',
        position: 'right',
        type: 'text',
        text: 'JavaScriptで配列のmapの使い方を教えて',
        date: new Date(),
        title: '',
        focus: false,
        titleColor: '',
        forwarded: false,
        reply: null,
        notch: true,
        avatar: '',
        status: 'received',
        replyButton: false,
        removeButton: false,
        retracted: false,
      },
      {
        id: '4',
        position: 'left',
        type: 'text',
        text: 'JavaScriptのmapの例です:\n```js\nconst arr = [1,2,3];\nconst doubled = arr.map(x => x * 2);\nconsole.log(doubled); // [2,4,6]\n```',
        date: new Date(),
        title: '',
        focus: false,
        titleColor: '',
        forwarded: false,
        reply: null,
        notch: true,
        avatar: '',
        status: 'sent',
        replyButton: false,
        removeButton: false,
        retracted: false,
      },
    ];
  },
};

// Azure AI Serviceとの接続
const azureService = {
  sendMessage: async (message: string) => {
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
};

// サービスのエクスポート
const service = config.mockMode ? mockService : azureService;
export default service;