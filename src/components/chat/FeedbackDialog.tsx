import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Box, Typography, Rating, TextField, 
  Radio, RadioGroup, FormControlLabel, FormControl, 
  InputAdornment, IconButton, Chip 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from 'react-i18next';

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  messageId: string;
  onSubmit: (data: FeedbackData) => void;
}

export interface FeedbackData {
  messageId: string;
  rating: number | null;
  feedbackType: string;
  comment: string;
  customFeedback?: string;
}

// フィードバックタイプの選択肢
const feedbackTypes = [
  { id: 'helpful', label: 'とても役に立った' },
  { id: 'accurate', label: '正確な情報だった' },
  { id: 'clear', label: '説明が分かりやすかった' },
  { id: 'confusing', label: '説明が分かりにくかった' },
  { id: 'incorrect', label: '情報が間違っていた' },
  { id: 'custom', label: 'その他' }
];

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onClose, messageId, onSubmit }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState('');
  const [comment, setComment] = useState('');
  const [customFeedback, setCustomFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit({
      messageId,
      rating,
      feedbackType,
      comment,
      customFeedback: feedbackType === 'custom' ? customFeedback : undefined
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setRating(null);
    setFeedbackType('');
    setComment('');
    setCustomFeedback('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
        py: 1.5
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          {t('Rate this response')}
        </Typography>
        <IconButton 
          aria-label="close" 
          onClick={handleClose}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              {t('How would you rate this response?')}
            </Typography>
            <Rating
              name="simple-controlled"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.55 }} />}
              size="large"
              sx={{ fontSize: '2rem', color: '#ffc107' }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              {t('What did you think about this response?')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {feedbackTypes.map((type) => (
                <Chip 
                  key={type.id}
                  label={t(type.label)}
                  onClick={() => setFeedbackType(type.id)}
                  color={feedbackType === type.id ? 'primary' : 'default'}
                  variant={feedbackType === type.id ? 'filled' : 'outlined'}
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: feedbackType === type.id ? 'primary.main' : 'rgba(0, 0, 0, 0.08)'
                    }
                  }}
                />
              ))}
            </Box>

            {feedbackType === 'custom' && (
              <TextField
                margin="dense"
                fullWidth
                placeholder={t('Please specify')}
                value={customFeedback}
                onChange={(e) => setCustomFeedback(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
              />
            )}
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              {t('Additional comments (optional)')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t('Tell us more about your experience...')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 1.5 
                } 
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: 1.5, textTransform: 'none', px: 3 }}
        >
          {t('Cancel')}
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          disabled={!rating || !feedbackType || (feedbackType === 'custom' && !customFeedback)}
          sx={{ borderRadius: 1.5, textTransform: 'none', px: 3 }}
        >
          {t('Submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
