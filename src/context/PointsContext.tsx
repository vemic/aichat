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

// インジケータの位置情報の型
type IndicatorPosition = {
  x: number;
  y: number;
};

type PointsContextType = {
  totalPoints: number;
  recentEvents: PointEvent[];
  unreadCount: number;
  indicatorPosition: IndicatorPosition;
  addPoints: (event: Omit<PointEvent, 'id' | 'timestamp' | 'read'>) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  updateIndicatorPosition: (position: IndicatorPosition) => void;
};

const PointsContext = createContext<PointsContextType>({
  totalPoints: 0,
  recentEvents: [],
  unreadCount: 0,
  indicatorPosition: { x: 0, y: 0 },
  addPoints: () => {},
  markAllAsRead: () => {},
  markAsRead: () => {},
  updateIndicatorPosition: () => {},
});

export const usePoints = () => useContext(PointsContext);

type PointsProviderProps = {
  children: ReactNode;
};

// ポイント獲得のルール設定
const POINT_RULES = {
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

  // インジケータの位置をローカルストレージから読み込む
  const [indicatorPosition, setIndicatorPosition] = useState<IndicatorPosition>(() => {
    const saved = localStorage.getItem('indicatorPosition');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });

  // 未読のポイントイベント数
  const unreadCount = recentEvents.filter(event => !event.read).length;

  // 状態変更時にローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('totalPoints', totalPoints.toString());
    localStorage.setItem('pointEvents', JSON.stringify(recentEvents));
  }, [totalPoints, recentEvents]);

  // インジケータの位置が変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('indicatorPosition', JSON.stringify(indicatorPosition));
  }, [indicatorPosition]);

  // ポイント追加処理
  const addPoints = (event: Omit<PointEvent, 'id' | 'timestamp' | 'read'>) => {
    // リアルタイムイベント（チャットメッセージ送信など）は通知ベルに表示しない
    const isRealTimeEvent = event.type === 'chat';
    
    const newEvent: PointEvent = {
      ...event,
      id: `point-${Date.now()}`,
      timestamp: Date.now(),
      // リアルタイムイベントは既読フラグをtrueにして通知ベルには表示しない
      read: isRealTimeEvent,
    };

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

  // インジケータの位置を更新
  const updateIndicatorPosition = (position: IndicatorPosition) => {
    setIndicatorPosition(position);
  };

  return (
    <PointsContext.Provider 
      value={{ 
        totalPoints, 
        recentEvents,
        unreadCount,
        indicatorPosition,
        addPoints, 
        markAllAsRead,
        markAsRead,
        updateIndicatorPosition
      }}
    >
      {children}
    </PointsContext.Provider>
  );
};

export default PointsProvider;
