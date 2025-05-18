import React, { useState } from 'react';
import {
  Box, Typography, Divider, List, ListItemButton, ListItemIcon,
  ListItemText, ListItem, ListItemAvatar, Avatar, IconButton, Tooltip,
  Badge, Chip
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FolderIcon from '@mui/icons-material/Folder';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import { useChatContext } from '../../context/ChatContext';

const Sidebar: React.FC<{
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}> = ({ sidebarOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const { mode } = useTheme(); const { threads, activeThreadId, setActiveThreadId, toggleBookmark, createThread } = useChatContext();

  const [showBookmarks, setShowBookmarks] = useState(true);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  const bookmarkedThreads = threads.filter(thread => thread.isBookmarked);
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

  const renderThreadItem = (thread: typeof threads[0]) => (
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
          secondary={thread.messages.length > 0 ?
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
  // サイドバー制御ボタン
  const SidebarToggleButton = (
    <Tooltip title={sidebarOpen ? t('Close sidebar') : t('Open sidebar')} placement="right">
      <IconButton
        onClick={toggleSidebar}
        size="small"
        sx={{
          position: 'absolute',
          top: 12,
          right: sidebarOpen ? 12 : '50%',
          transform: sidebarOpen ? 'none' : 'translateX(50%)',
          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          border: 1,
          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          '&:hover': {
            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          },
          zIndex: 10
        }}
      >
        {sidebarOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
  // サイドバーが閉じている場合のクリック領域 
  const collapsedSidebarClickArea = !sidebarOpen && (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 60,
        cursor: 'pointer',
        zIndex: 9, // zIndexを上げる
        // クリック領域を見やすくするため、ホバー時に薄く背景色を表示
        '&:hover': {
          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
        },
        pointerEvents: 'auto' // 明示的にポインターイベントを有効にする
      }}
      onClick={toggleSidebar}
    />
  );

  return (
    <Box sx={{
      p: 2,
      pl: sidebarOpen ? 2 : 0,
      pr: sidebarOpen ? 2 : 0,
      pt: sidebarOpen ? 2 : '50px',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Meiryo UI, Meiryo, "Segoe UI", "Hiragino Kaku Gothic ProN", Arial, sans-serif',
      bgcolor: mode === 'dark' ? 'background.paper' : '#f9fafb',
      borderRadius: 2,
      position: 'relative',
      transition: 'padding 0.3s'
    }}>
      {SidebarToggleButton}
      {collapsedSidebarClickArea}

      {sidebarOpen && (
        <>
          {/* New Chatボタン - サイドバーボタンと重複しないように上部マージンを追加 */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 4 // トグルボタンの下に十分なスペースを確保
          }}>
            <ListItemButton
              onClick={handleCreateNewChat}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                p: 1,
                width: 'auto',
                mb: 2
              }}
            >
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {t('New Chat')}
              </Typography>
            </ListItemButton>
          </Box>
          {bookmarkedThreads.length > 0 && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  mt: 1,
                  cursor: 'pointer'
                }}
                onClick={() => setShowBookmarks(!showBookmarks)}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <StarIcon sx={{ fontSize: '16px', mr: 0.5, color: '#f9a825' }} />
                  {t('Bookmarks')}
                </Typography>
              </Box>
              {showBookmarks && (
                <List sx={{ py: 0, mb: 1 }}>
                  {bookmarkedThreads.map(renderThreadItem)}
                </List>
              )}
              <Divider sx={{ my: 1 }} />
            </>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <HistoryIcon sx={{ fontSize: '16px', mr: 0.5 }} />
              {t('Chat History')}
            </Typography>
          </Box>

          <List sx={{ flex: 1, overflowY: 'auto', py: 0 }}>
            {threads.map(renderThreadItem)}
          </List>
        </>
      )}
    </Box>
  );
};

export default Sidebar;
