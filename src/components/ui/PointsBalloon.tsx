import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { usePoints } from '../../context/PointsContext';
import { useTranslation } from 'react-i18next';

// 空のexport文を追加してファイルをモジュールとして認識させる
export {};

// ポイントイベント用の型定義
type PointNotification = {
  id: string;
  points: number;
  timestamp: number;
};

// このコンポーネントは、ポイント獲得時の浮き出るバルーンを表示する
const PointsBalloon: React.FC = () => {
  const { t } = useTranslation();
  const { recentEvents } = usePoints();
  
  // 現在表示中のポイント
  const [animatingPoints, setAnimatingPoints] = useState<{points: number, visible: boolean}>({
    points: 0,
    visible: false
  });
  
  // 通知キュー - 複数の通知を順番に処理するために使用
  const [notificationQueue, setNotificationQueue] = useState<PointNotification[]>([]);
  
  // 最新イベントIDを追跡して新しいポイントが追加されたことを検出
  const [lastProcessedEventId, setLastProcessedEventId] = useState<string | null>(null);
  // 初期ロード済みフラグを追加
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  // アニメーション中フラグ
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 最新イベントの情報を抽出して依存配列に使用するための値を作成
  const latestEvent = recentEvents.length > 0 ? recentEvents[0] : null;
  const latestEventId = latestEvent?.id;
  
  // タイマー参照を保持
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 初期ロードを処理する効果
  useEffect(() => {
    // 初期ロード時はイベントを処理せず、ただIDを記録するのみ
    if (!initialLoadDone && latestEvent) {
      setLastProcessedEventId(latestEvent.id);
      setInitialLoadDone(true);
    }
  }, [initialLoadDone, latestEvent]);
  
  // 新しいポイント獲得を検出してキューに追加
  useEffect(() => {
    // 初期ロードが完了しており、最新イベントがあり、まだ処理していないIDで、かつ最近のイベント（60秒以内）である場合
    if (initialLoadDone && 
        latestEvent && 
        latestEvent.id !== lastProcessedEventId && 
        latestEvent.timestamp > Date.now() - 60000) {
      console.log('新しいポイント獲得を検出:', latestEvent);
      
      // 最新のポイント獲得イベントのIDを記録
      setLastProcessedEventId(latestEvent.id);
      
      // 通知キューに新しいイベントを追加
      setNotificationQueue(prev => [...prev, {
        id: latestEvent.id,
        points: latestEvent.points,
        timestamp: latestEvent.timestamp
      }]);
    }
  }, [latestEvent, latestEventId, lastProcessedEventId, initialLoadDone]);
  
  // 通知キューを処理する効果
  useEffect(() => {
    // アニメーション中でなく、キューに通知がある場合は次の通知を表示
    if (!isAnimating && notificationQueue.length > 0) {
      console.log('キューから次の通知を処理:', notificationQueue[0]);
      
      // アニメーション状態を開始
      setIsAnimating(true);
      
      // キューの最初の通知を表示
      const nextNotification = notificationQueue[0];
      setAnimatingPoints({
        points: nextNotification.points,
        visible: true
      });
      
      // アニメーション時間に合わせて、表示を終了（slideIn + fadeOut = 0.3s + 1.5s + 0.5s = 2.3s）
      timerRef.current = setTimeout(() => {
        // アニメーション表示を終了
        setAnimatingPoints(prev => ({ ...prev, visible: false }));
        
        // 処理済みの通知をキューから削除
        setNotificationQueue(prev => prev.slice(1));
        
        // アニメーション状態を終了（少し遅延させて、CSSアニメーションが完了するのを待つ）
        setTimeout(() => {
          setIsAnimating(false);
        }, 200);
      }, 2300);
      
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [notificationQueue, isAnimating]);  // キューの状態をデバッグ表示
  useEffect(() => {
    console.log('通知キュー状態:', { 
      queueLength: notificationQueue.length, 
      isAnimating, 
      currentlyVisible: animatingPoints.visible 
    });
  }, [notificationQueue, isAnimating, animatingPoints.visible]);

  // バルーンが表示されない場合は何も表示しない
  if (!animatingPoints.visible) {
    return null;
  }
  
  console.log('バルーン表示中:', animatingPoints);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out forwards, fadeOut 0.5s ease-out 1.5s forwards',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
        maxWidth: '250px',
        '@keyframes slideIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        '@keyframes fadeOut': {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 }
        }
      }}
    ><Box
        sx={{
          display: 'flex',
          bgcolor: 'rgba(129, 199, 132, 0.1)',  // さらに薄い緑色
          color: '#2e7d32', // success.dark相当の濃い緑色のテキスト
          px: 2,
          py: 1,
          borderRadius: 1,
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid',
          borderColor: 'rgba(129, 199, 132, 0.2)', // さらに薄いボーダー
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap'
        }}
      >
        <StarIcon sx={{ mr: 1, fontSize: '1rem', color: '#4caf50' }} />
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          +{animatingPoints.points} {t('ポイント')} {t('獲得')}
        </Typography>
      </Box>
    </Box>
  );
};

export default PointsBalloon;
