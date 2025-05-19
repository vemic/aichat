import React, { useState, useRef, useEffect } from 'react';
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
  const { mode } = useTheme();  const { 
    totalPoints, 
    recentEvents, 
    indicatorPosition, 
    updateIndicatorPosition 
  } = usePoints();
  
  const [open, setOpen] = useState(false);
  const [animatingPoints, setAnimatingPoints] = useState<{points: number, visible: boolean}>({
    points: 0,
    visible: false
  });
  
  // ドラッグ状態の管理
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(indicatorPosition);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  // マウスの移動距離を追跡するための状態を追加
  const startPosRef = useRef({ x: 0, y: 0 });
  // 移動距離の閾値（この値以上移動したらドラッグと判定）
  const DRAG_THRESHOLD = 3;
    
  // コンポーネント初期表示時に保存されたポジションを適用
  useEffect(() => {
    // ポジションが設定されていない（初期値の0,0）場合は、
    // デフォルトで右下に配置
    if (indicatorPosition.x === 0 && indicatorPosition.y === 0) {
      // 画面の右下に配置（少し余白を持たせる）
      const defaultX = window.innerWidth - 80;
      const defaultY = window.innerHeight - 100;
      setPosition({ x: defaultX, y: defaultY });
      // 初期設定をコンテキストに保存
      updateIndicatorPosition({ x: defaultX, y: defaultY });
    } else {
      setPosition(indicatorPosition);
    }
  }, [indicatorPosition, updateIndicatorPosition]);
  
  // ポイント通知機能は別なので、緑のポツを表示しない
  const hasRecentPoints = false;
  
  // 最新イベントIDを追跡して新しいポイントが追加されたことを検出
  const [lastProcessedEventId, setLastProcessedEventId] = useState<string | null>(null);
  // 最新イベントの情報を抽出して依存配列に使用するための値を作成
  const latestEvent = recentEvents.length > 0 ? recentEvents[0] : null;
  const latestEventId = latestEvent?.id;
    
  // このコンポーネントではポイント通知アニメーションは表示しない
  // PointsBalloonコンポーネントが通知を担当する
  React.useEffect(() => {
    // 最新イベントがあり、まだ処理していないIDの場合はIDを記録するだけ
    if (latestEvent && latestEvent.id !== lastProcessedEventId) {
      // 最新のポイント獲得イベントのIDを記録
      setLastProcessedEventId(latestEvent.id);
    }
  }, [latestEvent, latestEventId, lastProcessedEventId]);
  
  const handleOpen = () => {
    // クリック操作と判定された場合のみダイアログを開く
    if (!isDragging) {
      console.log('ポイントダイアログを開く');
      setOpen(true);
    }
  };
  
  const handleClose = () => setOpen(false);

  // ドラッグ開始処理
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (indicatorRef.current) {
      const rect = indicatorRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      // マウスダウン位置を記録
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY
      };
      // この時点ではドラッグを開始していないのでfalseに設定
      setIsDragging(false);
      
      // ドラッグ中のイベントをウィンドウに登録
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };
  
  // ドラッグ中処理
  const handleMouseMove = (e: MouseEvent) => {
    // 移動距離を計算
    const moveX = Math.abs(e.clientX - startPosRef.current.x);
    const moveY = Math.abs(e.clientY - startPosRef.current.y);
    
    // 閾値を超える移動があった場合、ドラッグ状態にする
    if (moveX > DRAG_THRESHOLD || moveY > DRAG_THRESHOLD) {
      setIsDragging(true);
    }
    
    // ドラッグ状態の場合のみ位置を更新
    if (isDragging) {
      // 画面外に出ないように制限を設定
      const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 70, e.clientY - dragOffsetRef.current.y));
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  };
  
  // ドラッグ終了処理
  const handleMouseUp = (e: MouseEvent) => {
    // 移動距離を計算
    const moveX = Math.abs(e.clientX - startPosRef.current.x);
    const moveY = Math.abs(e.clientY - startPosRef.current.y);
    
    // イベントリスナーを削除
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    
    // ドラッグ操作だった場合はドラッグ位置を保存
    if (isDragging) {
      updateIndicatorPosition(position);
    } else if (moveX <= DRAG_THRESHOLD && moveY <= DRAG_THRESHOLD) {
      // 小さい移動でドラッグ状態でなければクリックイベントを処理
      handleOpen();
    }
    
    // ドラッグ状態をリセット
    setIsDragging(false);
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
      ref={indicatorRef}
      sx={{ 
        position: 'fixed', 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        left: position.x,
        top: position.y,
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* ポイント獲得時のアニメーション表示 */}
      {animatingPoints.visible && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            right: '0',
            mb: 1,
            zIndex: 9999, // より前面に表示
            animation: 'floatUp 3s ease-out forwards, bounce 0.5s ease-in-out alternate 6',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
            '@keyframes floatUp': {
              '0%': { opacity: 0, transform: 'translateY(10px) scale(0.8)' },
              '10%': { opacity: 1, transform: 'translateY(0) scale(1.1)' },
              '20%': { transform: 'scale(1)' },
              '80%': { opacity: 1 },
              '100%': { opacity: 0, transform: 'translateY(-40px) scale(0.9)' }
            },
            '@keyframes bounce': {
              '0%': { transform: 'scale(1) translateY(0)' },
              '100%': { transform: 'scale(1.2) translateY(-5px)' }
            }
          }}
        >
          <Typography
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              px: 2.5,
              py: 1,
              borderRadius: 10,
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(255, 255, 255, 0.2) inset',
              whiteSpace: 'nowrap',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              animation: 'glow 1.5s ease-in-out infinite alternate',
              '@keyframes glow': {
                '0%': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(255, 255, 255, 0.2) inset' },
                '100%': { boxShadow: '0 4px 25px rgba(76, 175, 80, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.6) inset' }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                right: 15,
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid',
                borderTopColor: 'success.main',
              }
            }}
          >
            <StarIcon sx={{ mr: 1, fontSize: '1.3rem', color: 'yellow', filter: 'drop-shadow(0 0 3px rgba(255,255,0,0.5))' }} />
            +{animatingPoints.points} {t('ポイント')}
          </Typography>
        </Box>
      )}
      
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
            position: 'absolute',            top: '50%',
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '60vh', overflow: 'hidden' }}>
            {/* ポイント履歴リスト */}          <Box sx={{ 
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
