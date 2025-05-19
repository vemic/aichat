import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { usePoints } from '../../context/PointsContext';
// 開発用デバッグコンポーネント
const DebugPanel: React.FC = () => {
  const { addPoints } = usePoints();
    // ポイントを追加する関数
  const handleAddPoints = (type: 'login' | 'chat' | 'feedback' | 'signup' | 'daily' | 'other', points: number) => {
    const messages = {
      'login': 'ログインで5ポイント獲得しました',
      'chat': 'メッセージ送信で1ポイント獲得しました',
      'feedback': 'フィードバック提供で2ポイント獲得しました',
      'signup': '新規登録で50ポイント獲得しました',
      'daily': '毎日のボーナスで3ポイント獲得しました',
      'other': `${points}ポイント獲得しました`
    };
    
    addPoints({
      type,
      points,
      message: messages[type] || messages['other']
    });
  };
  
  return (
    <Paper
      sx={{
        position: 'fixed',
        left: 10,
        bottom: 10,
        p: 2,
        zIndex: 10000,
        opacity: 0.9,
        width: 220
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        デバッグパネル
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => handleAddPoints('chat', 1)}
        >
          チャットポイント+1
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => handleAddPoints('feedback', 2)}
        >
          フィードバックポイント+2
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => handleAddPoints('login', 5)}
        >
          ログインポイント+5
        </Button>
      </Box>
    </Paper>
  );
};

export default DebugPanel;
