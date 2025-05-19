import React, { useState } from 'react';
import { 
  Box, Badge, Tooltip, IconButton, Menu, MenuItem, 
  Typography, Avatar, Divider 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { usePoints } from '../../context/PointsContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import ChatIcon from '@mui/icons-material/Chat';
import LoginIcon from '@mui/icons-material/Login';
import FeedbackIcon from '@mui/icons-material/Feedback';

const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const { recentEvents, markAllAsRead } = usePoints();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  // 未読のイベント数
  const unreadCount = recentEvents.filter(e => !e.read).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    markAllAsRead();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LoginIcon fontSize="small" color="primary" />;
      case 'chat':
        return <ChatIcon fontSize="small" color="info" />;
      case 'feedback':
        return <FeedbackIcon fontSize="small" color="success" />;
      default:
        return <StarIcon fontSize="small" color="warning" />;
    }
  };

  // 通知アイテムのレンダリング
  const renderMenuItems = () => {
    if (recentEvents.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('お知らせはありません')}
          </Typography>
        </Box>
      );
    }

    return recentEvents.flatMap((event, index) => [
      <MenuItem 
        key={`item-${event.id}`}
        sx={{ 
          py: 1.5, 
          px: 2,
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', width: '100%' }}>
          <Avatar 
            sx={{ 
              width: 36,
              height: 36, 
              bgcolor: 'transparent' 
            }}
          >
            {getEventIcon(event.type)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4, mb: 0.5 }}>
              {event.message}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {format(event.timestamp, 'MM/dd HH:mm')}
              </Typography>
              <Typography variant="caption" color="primary" fontWeight={600}>
                +{event.points} {t('ポイント')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </MenuItem>,
      index < recentEvents.length - 1 ? <Divider key={`divider-${event.id}`} /> : null
    ]).filter(Boolean);
  };

  return (
    <Box>
      <Tooltip title={t('お知らせ')}>
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'notifications-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'notifications-button',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
            mt: 1.5,
            width: 350,
            maxHeight: 400,
            overflowY: 'auto',
            borderRadius: 2,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '3px',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {t('お知らせ')}
          </Typography>
          <IconButton size="small" onClick={handleClose} sx={{ mr: -0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider />
        {renderMenuItems()}
      </Menu>
    </Box>
  );
};

export default NotificationBell;
