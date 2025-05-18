import React, { useState } from 'react';
import { 
  Box, IconButton, Tooltip, Menu, MenuItem, 
  ListItemIcon, Typography, Divider 
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface MessageActionsProps {
  messageId: string;
  timestamp: number;
  content: string;
  onCopy: (text: string) => void;
  onShare: () => void;
  onFeedback: () => void;
  onExportMarkdown?: () => void;
  onExportPDF?: () => void;
  onExportWord?: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  timestamp,
  content,
  onCopy,
  onShare,
  onFeedback,
  onExportMarkdown,
  onExportPDF,
  onExportWord
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopy = () => {
    onCopy(content);
    handleClose();
  };

  const handleShare = () => {
    onShare();
    handleClose();
  };

  const handleFeedback = () => {
    onFeedback();
    handleClose();
  };

  const handleExportMarkdown = () => {
    if (onExportMarkdown) {
      onExportMarkdown();
      handleClose();
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
      handleClose();
    }
  };

  const handleExportWord = () => {
    if (onExportWord) {
      onExportWord();
      handleClose();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      mt: 1,
      color: 'text.secondary'
    }}>
      <Typography variant="caption">
        {format(timestamp, 'yyyy/MM/dd HH:mm')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title={t('Copy')}>
          <IconButton size="small" onClick={() => onCopy(content)}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('Share')}>
          <IconButton size="small" onClick={onShare}>
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('Rate')}>
          <IconButton size="small" onClick={onFeedback}>
            <ThumbUpIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('More')}>
          <IconButton
            size="small"
            onClick={handleClick}
            aria-controls={open ? 'message-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        id={`message-menu-${messageId}`}
        anchorEl={anchorEl}
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
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            width: 200,
          },
        }}
      >
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">{t('Copy text')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">{t('Share')}</Typography>
        </MenuItem>
        <Divider />        <MenuItem onClick={handleFeedback}>
          <ListItemIcon>
            <ThumbUpIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">{t('Rate response')}</Typography>
        </MenuItem>
        <Divider />
        <Typography variant="subtitle2" sx={{ px: 2, py: 0.5, color: 'text.secondary' }}>
          {t('Export as')}
        </Typography>
        {onExportMarkdown && (
          <MenuItem onClick={handleExportMarkdown}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">{t('Markdown')}</Typography>
          </MenuItem>
        )}
        {onExportPDF && (
          <MenuItem onClick={handleExportPDF}>
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">{t('PDF')}</Typography>
          </MenuItem>
        )}
        {onExportWord && (
          <MenuItem onClick={handleExportWord}>
            <ListItemIcon>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">{t('Word')}</Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default MessageActions;
