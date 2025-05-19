import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useTheme } from '../../context/ThemeContext';
import { format, isToday, parseISO } from 'date-fns';

const drawerWidth = 320;

const Layout: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();
  const { mode } = useTheme();
  
  // デイリーログインボーナスのチェック
  React.useEffect(() => {
    // 最後のログイン日をローカルストレージから取得
    const lastLoginDate = localStorage.getItem('lastLoginDate');
    const today = new Date();
    
    // 前回のログイン日が今日でない場合、デイリーボーナスを付与
    if (!lastLoginDate || !isToday(parseISO(lastLoginDate))) {
      // 最終ログイン日を更新
      localStorage.setItem('lastLoginDate', format(today, 'yyyy-MM-dd'));
    }
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // グローバルフォントと背景色の調整
  React.useEffect(() => {
    document.body.style.fontFamily = 'Meiryo UI, Meiryo, "Segoe UI", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
    document.body.style.background = mode === 'dark' ? '#121212' : '#f4f6fa';
    // 日本語ページであることを明示して翻訳を防ぐ
    document.documentElement.lang = 'ja';
  }, [mode]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (    <Box 
      sx={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        minWidth: '100vw',
        maxWidth: '100vw',
        maxHeight: '100vh',
        overflow: 'hidden',
        background: mode === 'dark' ? '#181818' : '#f5f5f5',
        position: 'relative' // PointsIndicatorのドラッグ領域指定のための親要素
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100vw',
        height: '100vh',
        boxSizing: 'border-box',
        overflow: 'hidden', 
      }}>
        <Box sx={{ width: sidebarOpen ? `${drawerWidth}px` : '40px', minWidth: 0, flexShrink: 0, height: '100vh', boxSizing: 'border-box', overflow: 'hidden', transition: 'width 0.2s' }}>
          <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center', alignItems: 'stretch', transition: 'all 0.2s', overflow: 'hidden' }}>
          <MainContent />
        </Box>      </Box>
    </Box>
  );
};

export default Layout;
