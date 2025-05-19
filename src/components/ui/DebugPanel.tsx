import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { usePoints } from '../../context/PointsContext';
import { useTranslation } from 'react-i18next';

// 開発用デバッグコンポーネント
const DebugPanel: React.FC = () => {
  const { addPoints } = usePoints();
  const { t } = useTranslation();
  
  // ポイントを追加する関数
  const handleAddPoints = (type: 'login' | 'chat' | 'feedback' | 'signup' | 'daily' | 'other', points: number) => {
    addPoints({
      type,
      points,
      message: t(`${points} points earned for ${type}`)
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
