import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// ポイント関連の型定義
type PointEvent = {
  id: string;
  type: 'login' | 'chat' | 'feedback' | 'signup' | 'daily' | 'other';
  points: number;
  message: string;
  timestamp: number;
  read: boolean;
};

type PointsContextType = {
  totalPoints: number;
  recentEvents: PointEvent[];
  unreadCount: number;
  addPoints: (event: Omit<PointEvent, 'id' | 'timestamp' | 'read'>) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
};

const PointsContext = createContext<PointsContextType>({
  totalPoints: 0,
  recentEvents: [],
  unreadCount: 0,
  addPoints: () => {},
  markAllAsRead: () => {},
  markAsRead: () => {},
});

export const usePoints = () => useContext(PointsContext);

type PointsProviderProps = {
  children: ReactNode;
};

// ポイント獲得のルール設定は参照用
export const POINT_RULES = {
  login: 5,       // ログイン
  chat: 1,        // チャット送信
  feedback: 2,    // フィードバック送信
  signup: 50,     // サインアップ
  daily: 3,       // 毎日のボーナス
};

export const PointsProvider: React.FC<PointsProviderProps> = ({ children }) => {
  // ローカルストレージから初期値を読み込む
  const [totalPoints, setTotalPoints] = useState<number>(() => {
    const saved = localStorage.getItem('totalPoints');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [recentEvents, setRecentEvents] = useState<PointEvent[]>(() => {
    const saved = localStorage.getItem('pointEvents');
    return saved ? JSON.parse(saved) : [];
  });

  // 未読のポイントイベント数
  const unreadCount = recentEvents.filter(event => !event.read).length;

  // 状態変更時にローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('totalPoints', totalPoints.toString());
    localStorage.setItem('pointEvents', JSON.stringify(recentEvents));
  }, [totalPoints, recentEvents]);

  // ポイント追加処理
  const addPoints = (event: Omit<PointEvent, 'id' | 'timestamp' | 'read'>) => {
    const timestamp = Date.now();
    const id = `point-${timestamp}`;
    
    const newEvent: PointEvent = {
      ...event,
      id,
      timestamp,
      // すべてのポイントイベントは既読状態（通知ベルに表示しない）
      read: true,
    };

    console.log('ポイント追加:', {
      id,
      type: event.type,
      points: event.points,
      message: event.message,
      timestamp
    });

    setTotalPoints(prev => prev + event.points);
    
    // イベントを先頭に追加し、最大20件に制限
    setRecentEvents(prev => [newEvent, ...prev].slice(0, 20));
  };

  // すべてのイベントを既読にする
  const markAllAsRead = () => {
    setRecentEvents(prev => 
      prev.map(event => ({ ...event, read: true }))
    );
  };

  // 特定のイベントを既読にする
  const markAsRead = (id: string) => {
    setRecentEvents(prev => 
      prev.map(event => 
        event.id === id ? { ...event, read: true } : event
      )
    );
  };

  return (
    <PointsContext.Provider 
      value={{ 
        totalPoints, 
        recentEvents,
        unreadCount,
        addPoints, 
        markAllAsRead,
        markAsRead,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
};

export default PointsProvider;
