import React, { useState, useEffect } from 'react';
import {   
  Box, Tooltip, Badge, Fab, Typography, Modal, 
  Paper, List, ListItem, ListItemText, IconButton,
  Divider, ListItemIcon, Card, CardContent
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import { usePoints } from '../../context/PointsContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

const PointsIndicator: React.FC = () => {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const { 
    totalPoints, 
    recentEvents
  } = usePoints();
  
  const [open, setOpen] = useState(false);
  
  // ポイント通知機能は別なので、緑のポツを表示しない
  const hasRecentPoints = false;
  
  // 最新イベントIDを追跡して新しいポイントが追加されたことを検出
  const [lastProcessedEventId, setLastProcessedEventId] = useState<string | null>(null);
  // 最新イベントの情報を抽出
  const latestEvent = recentEvents.length > 0 ? recentEvents[0] : null;
  
  // このコンポーネントではポイント通知アニメーションは表示しない
  // PointsBalloonコンポーネントが通知を担当する
  useEffect(() => {
    // 最新イベントがあり、まだ処理していないIDの場合はIDを記録するだけ
    if (latestEvent && latestEvent.id !== lastProcessedEventId) {
      // 最新のポイント獲得イベントのIDを記録
      setLastProcessedEventId(latestEvent.id);
    }
  }, [latestEvent, lastProcessedEventId]);
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => setOpen(false);

  // ポイント獲得方法の説明
  const pointsRules = [
    { type: 'login', points: 5, description: t('ログインするたびに獲得') },
    { type: 'chat', points: 1, description: t('チャットメッセージを送信') },
    { type: 'feedback', points: 2, description: t('AIの回答にフィードバックを提供') },
    { type: 'signup', points: 50, description: t('新規アカウント登録') },
    { type: 'daily', points: 3, description: t('毎日のログインボーナス') },
  ];

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bottom: '16px',
        right: '16px'
      }}
    >
      <Tooltip title={t('AIChatポイント')} placement="left">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          badgeContent={
            hasRecentPoints ? 
            <Box 
              sx={{ 
                width: 14, // サイズを小さく
                height: 14, // サイズを小さく
                bgcolor: 'success.main', 
                borderRadius: '50%', 
                border: '2px solid white',
                animation: hasRecentPoints ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                  '70%': { boxShadow: '0 0 0 7px rgba(76, 175, 80, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                }
              }} 
            /> : null
          }
        >
          <Fab
            color="primary"
            aria-label="points"
            onClick={handleOpen}
            size="small"
            sx={{ 
              bgcolor: 'warning.dark',
              '&:hover': {
                bgcolor: 'warning.main'
              },
              width: 42, // 小さいサイズに調整
              height: 42, // 小さいサイズに調整
              boxShadow: 2
            }}
          >
            <StarIcon sx={{ fontSize: '1.3rem' }} />
          </Fab>
        </Badge>
      </Tooltip>
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 0.5, 
          py: 0.2,
          px: 1,
          borderRadius: 10, 
          fontSize: '0.7rem',
          bgcolor: 'background.paper', 
          boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 8px rgba(255, 255, 255, 0.15)' : 1,
          fontWeight: 600
        }}
      >
        {totalPoints}
      </Typography>
      
      {/* ポイント履歴モーダル */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="points-history-modal"
        aria-describedby="points-history-description"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '92%', sm: 700, md: 900 },
            height: { xs: 'auto', md: '70vh' },
            maxHeight: '85vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            overflow: 'hidden',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle1" component="h2" sx={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 600 }}>
              <StarIcon sx={{ color: 'warning.main', mr: 1, fontSize: '1.1rem' }} />
              {t('AIchat ポイント')} - {totalPoints} {t('ポイント')}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%', overflow: 'hidden' }}>
            {/* ポイント履歴リスト */}
            <Box sx={{ 
              flex: 1, 
              p: 0,
              height: '100%',
              overflowY: 'auto',
              borderRight: { xs: 0, md: 1 },
              borderBottom: { xs: 1, md: 0 },
              borderColor: 'divider'
            }}>
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {t('最近の履歴')}
                </Typography>
              </Box>
              
              <List disablePadding sx={{ pb: 1 }}>
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <React.Fragment key={event.id}>
                      <ListItem 
                        secondaryAction={
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                            +{event.points}
                          </Typography>
                        }
                        sx={{ 
                          px: 2, 
                          py: 1, 
                          bgcolor: 'transparent',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={event.message}
                          secondary={format(new Date(event.timestamp), 'yyyy/MM/dd HH:mm')}
                          sx={{ 
                            '& .MuiListItemText-primary': { fontSize: '0.85rem' },
                            '& .MuiListItemText-secondary': { fontSize: '0.7rem' } 
                          }}
                        />
                      </ListItem>
                      <Divider component="li" variant="inset" sx={{ ml: 6 }} />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary={t('ポイント履歴はありません')} />
                  </ListItem>
                )}              </List>
            </Box>
            {/* ポイント獲得方法 */}            <Box sx={{ 
              flex: 1, 
              p: 2, 
              overflowY: 'auto', 
              height: '100%',
              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
            }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {t('ポイント獲得方法')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pointsRules.map((rule) => (
                  <Box key={rule.type}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        mb: 0, 
                        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {rule.description}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            bgcolor: 'success.main', 
                            color: 'white',
                            borderRadius: 10,
                            px: 1,
                            py: 0.3
                          }}>
                            <StarIcon sx={{ mr: 0.3, fontSize: '0.8rem' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                              +{rule.points}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default PointsIndicator;
