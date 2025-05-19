import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { usePoints } from '../../context/PointsContext';
import { useTranslation } from 'react-i18next';

// 空のexport文を追加してファイルをモジュールとして認識させる
export {};

// このコンポーネントは、ポイント獲得時の浮き出るバルーンを表示する
const PointsBalloon: React.FC = () => {
  const { t } = useTranslation();
  const { recentEvents } = usePoints();
  
  const [animatingPoints, setAnimatingPoints] = useState<{points: number, visible: boolean}>({
    points: 0,
    visible: false
  });
  
  // 最新イベントIDを追跡して新しいポイントが追加されたことを検出
  const [lastProcessedEventId, setLastProcessedEventId] = useState<string | null>(null);
  
  // 最新イベントの情報を抽出して依存配列に使用するための値を作成
  const latestEvent = recentEvents.length > 0 ? recentEvents[0] : null;
  const latestEventId = latestEvent?.id;
  // 新しいポイント獲得時にアニメーションを表示
  useEffect(() => {
    // 最新イベントがあり、まだ処理していないIDで、かつ最近のイベント（60秒以内）である場合
    if (latestEvent && 
        latestEvent.id !== lastProcessedEventId && 
        latestEvent.timestamp > Date.now() - 60000) {
      console.log('ポイント獲得を検出:', latestEvent);
      
      // 最新のポイント獲得イベントのIDを記録
      setLastProcessedEventId(latestEvent.id);
      
      // 新しいポイントを表示
      setAnimatingPoints({
        points: latestEvent.points,
        visible: true
      });
      
      // アニメーション時間に合わせて、表示を終了（slideIn + fadeOut = 0.3s + 1.5s + 0.5s = 2.3s）
      const timer = setTimeout(() => {
        setAnimatingPoints(prev => ({ ...prev, visible: false }));
      }, 2300);
      
      return () => clearTimeout(timer);
    }
  }, [latestEvent, latestEventId, lastProcessedEventId]);

  // バルーンが表示されない場合は何も表示しない
  if (!animatingPoints.visible) {
    return null;
  }  return (    <Box
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
    >
      <Box
        sx={{
          display: 'flex',
          bgcolor: 'success.light',
          color: 'success.contrastText',
          px: 2,
          py: 1,
          borderRadius: 1,
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid',
          borderColor: 'success.main',
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap'
        }}
      >
        <StarIcon sx={{ mr: 1, fontSize: '1rem', color: 'success.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          +{animatingPoints.points} {t('ポイント')} {t('獲得')}
        </Typography>
      </Box>
    </Box>
  );
};

export default PointsBalloon;
