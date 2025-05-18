import React, { useState } from 'react';
import {   
  Box, Tooltip, Badge, Fab, Typography, Modal, 
  Paper, List, ListItem, ListItemText, IconButton,
  Divider, ListItemIcon, Button, Card, CardContent
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { usePoints } from '../../context/PointsContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

const PointsIndicator: React.FC = () => {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const { totalPoints, recentEvents, markAllAsRead } = usePoints();
  const [open, setOpen] = useState(false);
  
  // 最近のポイント獲得イベント（10秒以内）
  const recentPointsGained = recentEvents.filter(
    event => Date.now() - event.timestamp < 10000
  ).length > 0;
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

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
        bottom: 20, 
        right: 20, 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Tooltip title={t('AIChatPoints')} placement="left">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          badgeContent={
            recentPointsGained ? 
            <Box 
              sx={{ 
                width: 18, 
                height: 18, 
                bgcolor: 'success.main', 
                borderRadius: '50%', 
                border: '2px solid white',
                animation: recentPointsGained ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)' },
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
            sx={{ 
              bgcolor: 'warning.dark',
              '&:hover': {
                bgcolor: 'warning.main'
              }
            }}
          >
            <StarIcon />
          </Fab>
        </Badge>
      </Tooltip>
      
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 0.5, 
          py: 0.3,
          px: 1.2,
          borderRadius: 1, 
          bgcolor: 'background.paper', 
          boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 8px rgba(255, 255, 255, 0.15)' : 1,
          fontWeight: 600
        }}
      >
        {totalPoints}      </Typography>
      
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
            width: { xs: '92%', sm: 600, md: 750 },
            maxHeight: '85vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            overflow: 'hidden',
            outline: 'none',
          }}
        >
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider'          }}>
            <Typography variant="subtitle1" component="h2" sx={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 600 }}>
              <StarIcon sx={{ color: 'warning.main', mr: 1, fontSize: '1.1rem' }} />
              {t('AIchat ポイント')} - {totalPoints} {t('ポイント')}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden' }}>
            {/* ポイント履歴リスト */}
            <Box sx={{ 
              flex: 2, 
              p: 0,
              height: { xs: '40vh', md: '60vh' },
              overflowY: 'auto',
              borderRight: { xs: 0, md: 1 },
              borderBottom: { xs: 1, md: 0 },
              borderColor: 'divider'
            }}>
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {t('ポイント履歴')}
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
                          bgcolor: !event.read ? (mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.04)') : 'transparent',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Badge
                            color="secondary"
                            variant="dot"
                            invisible={event.read}
                          >
                            <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
                          </Badge>
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
                )}
              </List>
                {recentEvents.length > 0 && (
                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    size="small"
                    onClick={handleMarkAllAsRead}
                    startIcon={<CheckCircleIcon fontSize="small" />}
                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                  >
                    {t('すべて既読にする')}
                  </Button>
                </Box>
              )}
            </Box>
              {/* ポイント獲得方法 */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', height: { xs: '40vh', md: '60vh' } }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {t('ポイント獲得方法')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {pointsRules.map((rule) => (
                  <Box key={rule.type}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        mb: 1, 
                        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'
                      }}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                            {rule.description}
                          </Typography>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                            +{rule.points}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default PointsIndicator;
