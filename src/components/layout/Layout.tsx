import React, { useState } from 'react';
import { 
  Box, CssBaseline, Drawer, Toolbar, AppBar, Typography, IconButton, 
  Avatar, Menu, MenuItem, ListItemIcon, Divider, Tooltip 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import InfoIcon from '@mui/icons-material/Info';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import NotificationBell from '../ui/NotificationBell';
import PointsIndicator from '../ui/PointsIndicator';
import { useTheme } from '../../context/ThemeContext';
import { usePoints } from '../../context/PointsContext';
import { format, isToday, parseISO } from 'date-fns';

const drawerWidth = 320;

const Layout: React.FC = () => {  const { t } = useTranslation();
  const { mode, toggleColorMode } = useTheme();
  const { addPoints } = usePoints();
  
  // デイリーログインボーナスのチェック
  React.useEffect(() => {
    // 最後のログイン日をローカルストレージから取得
    const lastLoginDate = localStorage.getItem('lastLoginDate');
    const today = new Date();
    
    // 前回のログイン日が今日でない場合、デイリーボーナスを付与
    if (!lastLoginDate || !isToday(parseISO(lastLoginDate))) {
      // デイリーログインボーナスを追加
      addPoints({
        type: 'daily',
        points: 3,
        message: t('デイリーログインボーナスとして3ポイント獲得しました！')
      });
      
      // 最終ログイン日を更新
      localStorage.setItem('lastLoginDate', format(today, 'yyyy-MM-dd'));
    }
  }, [addPoints, t]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contentWidth, setContentWidth] = useState(800);
  const [isResizing, setIsResizing] = useState(false);
  const open = Boolean(anchorEl);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // ログイン状態（仮）
  
  // グローバルフォントと背景色の調整
  React.useEffect(() => {
    document.body.style.fontFamily = 'Meiryo UI, Meiryo, "Segoe UI", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
    document.body.style.background = mode === 'dark' ? '#121212' : '#f4f6fa';
    // 日本語ページであることを明示して翻訳を防ぐ
    document.documentElement.lang = 'ja';
  }, [mode]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };  const handleToggleLogin = () => {
    const newLoginState = !isLoggedIn;
    setIsLoggedIn(newLoginState);
    
    // ログイン時にポイントを追加
    if (newLoginState) {
      // ログイン時にポイント獲得
      addPoints({
        type: 'login',
        points: 5,
        message: t('ログインボーナスとして5ポイント獲得しました！')
      });
    }
    
    handleClose();
  };

  // チャット履歴の幅調整用
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // 幅を計算（最小幅: 400px、最大幅: 90%）
      const newWidth = Math.min(Math.max(e.clientX - 320, 400), window.innerWidth * 0.9);
      setContentWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      bgcolor: 'background.default',
      fontFamily: 'Meiryo UI, Meiryo, "Segoe UI", "Hiragino Kaku Gothic ProN", Arial, sans-serif' 
    }}>
      <CssBaseline />
      
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1, 
          boxShadow: mode === 'dark' ? '0 1px 2px rgba(255,255,255,0.1)' : 1, 
          bgcolor: 'background.paper', 
          color: 'text.primary' 
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
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
              {t('AI Chat Bot')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={mode === 'dark' ? t('Light mode') : t('Dark mode')}>
              <IconButton onClick={toggleColorMode} size="small" color="inherit">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            <NotificationBell />
            
            <Tooltip title={t('User settings')}>
              <IconButton
                onClick={handleClick}
                size="small"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.main'
                  }}
                >
                  G
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

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
                  bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.main',
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
                  // サインアップ時にポイント付与
                  addPoints({
                    type: 'signup',
                    points: 50,
                    message: t('新規ユーザー登録ボーナスとして50ポイント獲得しました！')
                  });
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
        </Toolbar>
      </AppBar>
        <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? drawerWidth : 60,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            borderRadius: 1, 
            height: 'calc(100vh - 64px)', 
            mt: '64px', 
            bgcolor: 'background.paper', 
            boxShadow: mode === 'dark' ? '0 0 10px rgba(255, 255, 255, 0.08)' : 2,
            transition: 'transform 0.3s ease',
            transform: sidebarOpen ? 'translateX(0)' : `translateX(-${drawerWidth - 60}px)`,
            // ミニサイドバーを閉じられないようにする
            pointerEvents: 'auto',            // サイドバー内の要素のポインターイベント制御
            '& > *': {
              pointerEvents: 'auto' // 常にクリック可能にする
            }
          },
          display: { xs: 'none', sm: 'block' },
          // 非表示でもホバー可能にする
          zIndex: (theme) => theme.zIndex.drawer
        }}
        open={true} // 常にオープン状態
      >
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </Drawer>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            borderRadius: 1, 
            mt: '64px', 
            height: 'calc(100vh - 64px)', 
            bgcolor: 'background.paper', 
            boxShadow: mode === 'dark' ? '0 0 10px rgba(255, 255, 255, 0.08)' : 2
          },
        }}
      >
        <Sidebar sidebarOpen={true} toggleSidebar={handleDrawerToggle} />
      </Drawer>
      
      <Box
        component="main"
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexGrow: 1, 
          p: 2, 
          ml: { sm: sidebarOpen ? `${drawerWidth}px` : '60px' }, 
          mt: '64px', 
          transition: 'margin-left 0.3s ease',
          fontFamily: 'Meiryo UI, Meiryo, "Segoe UI", "Hiragino Kaku Gothic ProN", Arial, sans-serif',
          position: 'relative'
        }}
      >
        <Box 
          sx={{ 
            width: `${contentWidth}px`,
            maxWidth: '95%', 
            position: 'relative',
            bgcolor: 'background.paper', 
            borderRadius: 1, 
            boxShadow: 1, 
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          <MainContent />
          
          <Box 
            sx={{ 
              position: 'absolute', 
              right: -6, 
              top: 0, 
              bottom: 0, 
              width: 12, 
              cursor: 'ew-resize',
              '&:hover': { 
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              },
              '&:active': { 
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
              },
              borderRadius: '0 4px 4px 0'
            }}
            onMouseDown={handleMouseDown}
          />
        </Box>
        
        {/* ポイントインジケーター */}
        <PointsIndicator />
      </Box>
    </Box>
  );
};

export default Layout;
