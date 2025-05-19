import React, { useState } from 'react';
import {   
  Box, Typography, Divider, List, ListItemButton, ListItemIcon,
  ListItemText, ListItem, ListItemAvatar, Avatar, IconButton, Tooltip,
  Badge, Chip, Menu, MenuItem, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import InfoIcon from '@mui/icons-material/Info';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import { useChatContext } from '../../context/ChatContext';
import { usePoints } from '../../context/PointsContext';
import NotificationBell from '../ui/NotificationBell';

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const { mode, toggleColorMode, contentWidth, setContentWidth, chatFontSize, setChatFontSize } = useTheme(); 
  const { threads, activeThreadId, setActiveThreadId, toggleBookmark, createThread } = useChatContext();
  const { totalPoints, recentEvents, markAllAsRead } = usePoints();

  const [showBookmarks, setShowBookmarks] = useState(true);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // ログイン状態（仮）
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const open = Boolean(anchorEl);

  // 最近のポイント獲得イベント（10秒以内）の有無を確認
  const hasRecentPoints = recentEvents.filter(
    event => Date.now() - event.timestamp < 10000
  ).length > 0;

  const bookmarkedThreads = threads.filter(thread => thread.isBookmarked);
  
  // ユーザーメニュー関連
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleLogin = () => {
    const newLoginState = !isLoggedIn;
    setIsLoggedIn(newLoginState);
    handleClose();
  };
  
  // ブックマーク切り替え
  const handleToggleBookmark = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleBookmark(id);
  };

  // 新しいチャットを作成
  const handleCreateNewChat = async () => {
    const newThreadId = await createThread();
    setActiveThreadId(newThreadId);
  };
  
  // コンテンツ幅の変更処理
  const handleChangeContentWidth = (newWidth: 'narrow' | 'medium' | 'wide') => {
    setContentWidth(newWidth);
  };
  
  // フォントサイズの変更処理
  const handleChangeFontSize = (newSize: 'small' | 'medium' | 'large') => {
    setChatFontSize(newSize);
  };

  // ポイントモーダルを開く
  const handleOpenPointsModal = () => {
    setPointsModalOpen(true);
  };

  // ポイントモーダルを閉じる
  const handleClosePointsModal = () => {
    setPointsModalOpen(false);
  };

  // すべてのイベントを既読にする
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

  const renderThreadItem = (thread: any) => (
    <ListItem
      key={thread.id}
      disablePadding
      sx={{ mb: 0.5 }}
      onMouseEnter={() => setHoveredChat(thread.id)}
      onMouseLeave={() => setHoveredChat(null)}
    >
      <ListItemButton
        onClick={() => setActiveThreadId(thread.id)}
        sx={{
          borderRadius: 1,
          p: '4px 8px',
          bgcolor: activeThreadId === thread.id
            ? mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.08)'
            : 'transparent',
          '&:hover': {
            bgcolor: activeThreadId === thread.id
              ? mode === 'dark' ? 'rgba(144, 202, 249, 0.24)' : 'rgba(25, 118, 210, 0.12)'
              : mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <ListItemAvatar sx={{ minWidth: 36 }}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: activeThreadId === thread.id
                ? mode === 'dark' ? '#90caf9' : '#1976d2'
                : mode === 'dark' ? '#616161' : '#9e9e9e'
            }}
          >
            <SmartToyIcon sx={{ fontSize: '16px' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={thread.title}
          secondary={thread.messages?.length > 0 ?
            thread.messages[thread.messages.length - 1].content.substring(0, 30) + '...' :
            t('No messages')}
          primaryTypographyProps={{
            variant: 'subtitle2',
            sx: {
              fontWeight: activeThreadId === thread.id ? 600 : 400,
              fontSize: '0.815rem',
              color: mode === 'dark'
                ? activeThreadId === thread.id ? 'primary.light' : 'text.primary'
                : 'inherit'
            }
          }}
          secondaryTypographyProps={{
            sx: {
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3
            },
            component: 'p'
          }}
          sx={{ m: 0 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {format(new Date(thread.lastUpdated), 'MM/dd')}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => handleToggleBookmark(thread.id, e)}
            sx={{
              opacity: hoveredChat === thread.id || thread.isBookmarked ? 1 : 0,
              transition: 'opacity 0.2s',
              p: 0.5
            }}
          >
            {thread.isBookmarked
              ? <StarIcon sx={{ fontSize: '16px', color: '#f9a825' }} />
              : <StarBorderIcon sx={{ fontSize: '16px' }} />
            }
          </IconButton>
        </Box>
      </ListItemButton>
    </ListItem>
  );

  if (!sidebarOpen) {
    return (
      <Box sx={{
        width: '40px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.default',
        borderRight: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        zIndex: 1202,
        p: 1,
        pt: 2,
        pb: 2,
      }}>
        {/* 上部にサイドバー開くボタン */}
        <Box sx={{ mb: 2 }}>
          <Tooltip title={t('Open sidebar')} placement="right">
            <IconButton onClick={toggleSidebar} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* 中央部にアイコン */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
          <Tooltip title={t('New Chat')} placement="right">
            <IconButton size="small" onClick={handleCreateNewChat}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* 下部にユーザーアイコンとポイント表示 */}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Tooltip title={t('Theme Toggle')} placement="right">
            <IconButton onClick={toggleColorMode} size="small">
              {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          {/* ポイント表示 - サイドバーが閉じているとき */}
          <Tooltip title={`${t('Points')}: ${totalPoints}`} placement="right">
            <IconButton 
              size="small" 
              onClick={handleOpenPointsModal}
              sx={{ 
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                color: 'primary.main'
              }}
            >
              <CurrencyExchangeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t('User settings')} placement="right">
            <IconButton onClick={handleClick} size="small">
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>G</Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* ポイント履歴モーダル */}
        <Dialog
          open={pointsModalOpen}
          onClose={handleClosePointsModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CurrencyExchangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">{t('ポイント履歴')}</Typography>
              </Box>
              <IconButton size="small" onClick={handleClosePointsModal}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Card sx={{ width: '100%', textAlign: 'center', p: 2, mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalPoints} <Typography component="span" variant="body1">{t('ポイント')}</Typography>
                </Typography>
              </Card>
            </Box>
            
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              {t('最近の履歴')}
            </Typography>
            
            <List sx={{ mb: 2 }}>
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <ListItem
                    key={event.id}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      py: 1
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CurrencyExchangeIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.message}
                      secondary={format(new Date(event.timestamp), 'yyyy/MM/dd HH:mm')}
                      sx={{ 
                        '& .MuiListItemText-primary': { fontSize: '0.9rem' },
                        '& .MuiListItemText-secondary': { fontSize: '0.75rem' } 
                      }}
                    />
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      +{event.points}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary={t('履歴はありません')} />
                </ListItem>
              )}
            </List>
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
              {t('ポイント獲得方法')}
            </Typography>
            
            <List>
              {pointsRules.map((rule) => (
                <Card
                  key={rule.type}
                  variant="outlined"
                  sx={{ mb: 1 }}
                >
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">{rule.description}</Typography>
                      <Chip
                        label={`+${rule.points}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            {recentEvents.length > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                startIcon={<CheckCircleIcon />}
              >
                {t('すべて既読にする')}
              </Button>
            )}
            <Button onClick={handleClosePointsModal} variant="contained">
              {t('閉じる')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Meiryo UI, Meiryo, "Segoe UI", "Hiragino Kaku Gothic ProN", Arial, sans-serif',
      bgcolor: mode === 'dark' ? 'background.paper' : '#f9fafb',
      position: 'relative',
      transition: 'background-color 0.2s',
    }}>
      {/* ヘッダー部分 - AppBarの代わり */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
      }}>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            fontWeight: 600, 
            fontSize: { xs: '1.1rem', sm: '1.2rem' },
            fontFamily: '"M PLUS Rounded 1c", Meiryo UI, Meiryo, "Segoe UI", sans-serif'
          }}
        >
          aichat
        </Typography>
        
        {/* サイドバーを閉じるボタンのみ残す */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={t('Close sidebar')}>
            <IconButton
              onClick={toggleSidebar}
              size="small"
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* メイン部分（チャット履歴） */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* New Chatボタン */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            mb: 2
          }}>
            <ListItemButton
              onClick={handleCreateNewChat}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                p: 1,
                width: '100%',
                bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.light',
                color: mode === 'dark' ? 'white' : 'white',
                '&:hover': {
                  bgcolor: 'primary.main',
                }
              }}
            >
              <AddIcon sx={{ fontSize: '1rem', mr: 1 }} />
              <Typography sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                {t('New Chat')}
              </Typography>
            </ListItemButton>
          </Box>
          
          {/* ブックマーク済みチャット */}
          {bookmarkedThreads.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  sx={{ p: 0.5, mr: 0.5 }}
                >
                  {showBookmarks ? 
                    <ArrowBackIcon 
                      sx={{ 
                        fontSize: '0.85rem', 
                        transform: 'rotate(90deg)' 
                      }} 
                    /> : 
                    <ArrowForwardIcon 
                      sx={{ 
                        fontSize: '0.85rem', 
                        transform: 'rotate(90deg)' 
                      }} 
                    />
                  }
                </IconButton>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    letterSpacing: 0.5
                  }}
                >
                  {t('Bookmarks')} ({bookmarkedThreads.length})
                </Typography>
              </Box>
              
              {showBookmarks && (
                <List dense disablePadding sx={{ mb: 2 }}>
                  {bookmarkedThreads.map(thread => renderThreadItem(thread))}
                </List>
              )}
              
              <Divider sx={{ mt: 0, mb: 2 }} />
            </>
          )}
          
          {/* 最近のチャットリスト */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                color: 'text.secondary',
                letterSpacing: 0.5
              }}
            >
              {t('Recent')}
            </Typography>
          </Box>
          
          <Box sx={{ overflow: 'auto', flex: 1 }}>
            <List dense disablePadding>
              {threads.filter(thread => !thread.isBookmarked).map(thread => renderThreadItem(thread))}
              
              {threads.length === 0 && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    textAlign: 'center', 
                    p: 2,
                    fontSize: '0.85rem',
                    fontStyle: 'italic'
                  }}
                >
                  {t('No chat history yet')}
                </Typography>
              )}
            </List>
          </Box>
        </Box>
      </Box>
      
      {/* フッター（設定） */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        {/* レイアウト設定セクション */}
        <Box sx={{ 
          mb: 2, 
          p: 1.5, 
          borderRadius: 1,
          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontSize: '0.75rem', fontWeight: 600 }}>
            {t('Layout Settings')}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            {/* コンテンツ幅設定 */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'block', 
                  mb: 0.5,
                  fontSize: '0.7rem'
                }}
              >
                {t('Content Width')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={t('Narrow')}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleChangeContentWidth('narrow')}
                    color={contentWidth === 'narrow' ? 'primary' : 'default'}
                    sx={{ p: 0.5 }}
                  >
                    <TextFieldsIcon sx={{ fontSize: '12px' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('Medium')}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleChangeContentWidth('medium')}
                    color={contentWidth === 'medium' ? 'primary' : 'default'}
                    sx={{ p: 0.5 }}
                  >
                    <TextFieldsIcon sx={{ fontSize: '14px' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('Wide')}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleChangeContentWidth('wide')}
                    color={contentWidth === 'wide' ? 'primary' : 'default'}
                    sx={{ p: 0.5 }}
                  >
                    <TextFieldsIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* フォントサイズ設定 */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'block', 
                  mb: 0.5,
                  fontSize: '0.7rem'
                }}
              >
                {t('Font Size')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={t('Small')}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleChangeFontSize('small')}
                    color={chatFontSize === 'small' ? 'primary' : 'default'}
                    sx={{ p: 0.5 }}
                  >
                    <TextFieldsIcon sx={{ fontSize: '12px' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('Medium')}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleChangeFontSize('medium')}
                    color={chatFontSize === 'medium' ? 'primary' : 'default'}
                    sx={{ p: 0.5 }}
                  >
                    <TextFieldsIcon sx={{ fontSize: '14px' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('Large')}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleChangeFontSize('large')}
                    color={chatFontSize === 'large' ? 'primary' : 'default'}
                    sx={{ p: 0.5 }}
                  >
                    <TextFieldsIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* テーマの切り替え */}
            <Tooltip title={mode === 'dark' ? t('Light mode') : t('Dark mode')}>
              <IconButton onClick={toggleColorMode} size="small" color="inherit" sx={{ p: 0.5 }}>
                {mode === 'dark' ? <LightModeIcon sx={{ fontSize: '14px' }} /> : <DarkModeIcon sx={{ fontSize: '14px' }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* ユーザー情報とお知らせ */}
        <Box sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderRadius: 1,
          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
        }}>
          {/* ポイント表示 - サイドバーが開いているとき */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'
              }
            }}
            onClick={handleOpenPointsModal}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              badgeContent={
                hasRecentPoints ? 
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: 'success.main', 
                    borderRadius: '50%', 
                    border: '1px solid white',
                    animation: hasRecentPoints ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                      '70%': { boxShadow: '0 0 0 4px rgba(76, 175, 80, 0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                    }
                  }} 
                /> : null
              }
            >
              <CurrencyExchangeIcon sx={{ color: 'primary.main', fontSize: '1rem', mr: 0.5 }} />
            </Badge>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                fontSize: '0.8rem',
                color: 'primary.main'
              }}
            >
              {totalPoints}
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              cursor: 'pointer',
              borderRadius: 1,
              p: 0.5,
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
              }
            }}
            onClick={handleClick}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar 
              sx={{ 
                width: 28, 
                height: 28, 
                bgcolor: 'primary.main'
              }}
            >
              G
            </Avatar>
            
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
              {isLoggedIn ? 'ゲストユーザー' : t('Guest')}
            </Typography>
          </Box>
          
          <NotificationBell />
        </Box>
      </Box>
      
      {/* ユーザーメニュー */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 220,
            p: 1,
          },
        }}
      >
        <Box sx={{ p: 2, mb: 1, textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              mb: 1, 
              mx: 'auto',
              bgcolor: 'primary.main',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            G
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {isLoggedIn ? 'ゲストユーザー' : t('Welcome')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {isLoggedIn ? 'guest@example.com' : t('Please login to continue')}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleClose} sx={{ borderRadius: 1, py: 1 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">{t('Settings')}</Typography>
        </MenuItem>
        
        <MenuItem onClick={handleToggleLogin} sx={{ borderRadius: 1, py: 1 }}>
          <ListItemIcon>
            {isLoggedIn ? <LogoutIcon fontSize="small" /> : <LoginIcon fontSize="small" />}
          </ListItemIcon>
          <Typography variant="body2">
            {isLoggedIn ? t('Logout') : t('Login')}
          </Typography>
        </MenuItem>
        
        {!isLoggedIn && (
          <MenuItem 
            onClick={() => {
              setIsLoggedIn(true);
              handleClose();
            }} 
            sx={{ borderRadius: 1, py: 1 }}
          >
            <ListItemIcon>
              <PersonAddIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">{t('Sign up')}</Typography>
          </MenuItem>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem onClick={handleClose} sx={{ borderRadius: 1, py: 1 }}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">{t('About')}</Typography>
        </MenuItem>
      </Menu>

      {/* ポイント履歴モーダル */}
      <Dialog
        open={pointsModalOpen}
        onClose={handleClosePointsModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CurrencyExchangeIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{t('ポイント履歴')}</Typography>
            </Box>
            <IconButton size="small" onClick={handleClosePointsModal}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card sx={{ width: '100%', textAlign: 'center', p: 2, mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalPoints} <Typography component="span" variant="body1">{t('ポイント')}</Typography>
              </Typography>
            </Card>
          </Box>
          
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            {t('最近の履歴')}
          </Typography>
          
          <List sx={{ mb: 2 }}>
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <ListItem
                  key={event.id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 1
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CurrencyExchangeIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.message}
                    secondary={format(new Date(event.timestamp), 'yyyy/MM/dd HH:mm')}
                    sx={{ 
                      '& .MuiListItemText-primary': { fontSize: '0.9rem' },
                      '& .MuiListItemText-secondary': { fontSize: '0.75rem' } 
                    }}
                  />
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                    +{event.points}
                  </Typography>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary={t('履歴はありません')} />
              </ListItem>
            )}
          </List>
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            {t('ポイント獲得方法')}
          </Typography>
          
          <List>
            {pointsRules.map((rule) => (
              <Card
                key={rule.type}
                variant="outlined"
                sx={{ mb: 1 }}
              >
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">{rule.description}</Typography>
                    <Chip
                      label={`+${rule.points}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          {recentEvents.length > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCircleIcon />}
            >
              {t('すべて既読にする')}
            </Button>
          )}
          <Button onClick={handleClosePointsModal} variant="contained">
            {t('閉じる')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
