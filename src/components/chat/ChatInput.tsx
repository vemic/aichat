import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { 
  Box, Button, TextField, Tooltip, IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Stack, Typography,
  Popover
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudIcon from '@mui/icons-material/Cloud';
import OneDriveIcon from '@mui/icons-material/Storage';
import SharePointIcon from '@mui/icons-material/Folder';
import Microsoft365Icon from '@mui/icons-material/Apps';
import TextFieldsIcon from '@mui/icons-material/TextFields';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ALLOWED_FILE_TYPES = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';

// GPTモデルの選択肢
const MODEL_OPTIONS = [
  { value: 'gpt-4.1', label: 'GPT-4.1 (デフォルト)' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
];

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const [input, setInput] = useState('');
  const [rows, setRows] = useState(3);
  const textFieldRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].value);
  
  // 入力履歴管理
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // 入力補完の候補
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  // メニュー制御
  const [modelAnchorEl, setModelAnchorEl] = useState<null | HTMLElement>(null);
  const [serviceAnchorEl, setServiceAnchorEl] = useState<null | HTMLElement>(null);
  const [attachmentAnchorEl, setAttachmentAnchorEl] = useState<null | HTMLElement>(null);
  
  const modelMenuOpen = Boolean(modelAnchorEl);
  const serviceMenuOpen = Boolean(serviceAnchorEl);
  const attachmentMenuOpen = Boolean(attachmentAnchorEl);
  
  // モデル選択メニュー
  const handleModelMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setModelAnchorEl(event.currentTarget);
  };
  
  const handleModelMenuClose = () => {
    setModelAnchorEl(null);
  };
  
  const handleModelChange = (modelValue: string) => {
    setSelectedModel(modelValue);
    handleModelMenuClose();
  };
  
  // サービス接続メニュー
  const handleServiceMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setServiceAnchorEl(event.currentTarget);
  };
  
  const handleServiceMenuClose = () => {
    setServiceAnchorEl(null);
  };
  
  // 添付ファイルメニュー
  const handleAttachmentMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAttachmentAnchorEl(event.currentTarget);
  };
  
  const handleAttachmentMenuClose = () => {
    setAttachmentAnchorEl(null);
  };
  
  // ファイル選択ダイアログを表示
  const handleFileSelect = () => {
    fileInputRef.current?.click();
    handleAttachmentMenuClose();
  };
  
  // 選択されたファイルを処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  // ファイルを削除
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // 入力フィールドの高さを動的に調整
  useEffect(() => {
    const lineCount = (input.match(/\n/g) || []).length + 1;
    setRows(Math.min(Math.max(3, lineCount), 10)); // 最小3行、最大10行
  }, [input]);
  
  // クリップボードからの画像貼り付け
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              setFiles(prev => [...prev, file]);
              e.preventDefault();
              break;
            }
          }
        }
      }
    };
    
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);
  
  // ドラッグ&ドロップの処理
  useEffect(() => {
    const textField = textFieldRef.current;
    if (!textField) return;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer && e.dataTransfer.files) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(file => {
          const fileType = `.${file.name.split('.').pop()?.toLowerCase()}`;
          return ALLOWED_FILE_TYPES.includes(fileType);
        });
        
        if (validFiles.length > 0) {
          setFiles(prev => [...prev, ...validFiles]);
        }
      }
    };
    
    textField.addEventListener('dragover', handleDragOver);
    textField.addEventListener('drop', handleDrop);
    
    return () => {
      textField.removeEventListener('dragover', handleDragOver);
      textField.removeEventListener('drop', handleDrop);
    };
  }, []);
  // メッセージ送信
  const handleSend = () => {
    if (input.trim()) {
      // 実際の実装では、ここでファイルをアップロードしてURLを取得する処理を追加
      // この例では、ファイル名をメッセージに追加するだけ
      let message = input;
      
      if (files.length > 0) {
        message += '\n\n添付ファイル:';
        files.forEach(file => {
          message += `\n- ${file.name}`;
        });
      }
      
      // 入力履歴に追加
      setInputHistory(prev => [input, ...prev].slice(0, 20)); // 最大20件に制限
      setHistoryIndex(-1);
        onSendMessage(message);
      setInput('');
      setFiles([]);
      
      // ポイント追加はMainContentで行うため、ここでは行わない
    }
  };
    // キーボードショートカット
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Enterで送信
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    
    // 上下キーで入力履歴をナビゲート
    if (e.key === 'ArrowUp' && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      
      // 現在の入力がある場合、履歴に追加せずに現在の入力を保持
      if (historyIndex === -1 && input.trim()) {
        setInputHistory(prev => [input, ...prev].slice(0, 20)); // 最大20件に制限
      }
      
      // 履歴がある場合、前の履歴を表示
      if (inputHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
      }
    }
    
    // 下キーで次の履歴を表示
    if (e.key === 'ArrowDown' && !e.ctrlKey && !e.shiftKey && historyIndex > -1) {
      e.preventDefault();
      
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      if (newIndex === -1) {
        setInput(''); // 最後に空の入力に戻る
      } else {
        setInput(inputHistory[newIndex]);
      }
    }
    
    // Ctrl+Spaceで入力補完を表示
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault();
      showCompletionSuggestions(e);
    }
  };
  
  // 入力補完候補を表示
  const showCompletionSuggestions = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLElement;
    setAnchorEl(target);
    
    // 本来はAPIからの補完候補を取得するが、ここではモックデータ
    const mockSuggestions = [
      '前回の続きについて教えてください',
      'このエラーの原因はなんですか？',
      'もっと詳しく説明してください',
      'コードサンプルを示してください',
      'このアプローチのメリット・デメリットは？'
    ];
    
    setSuggestions(mockSuggestions);
    setShowSuggestions(true);
  };
  
  // 補完候補を選択
  const handleSuggestionSelect = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };
  
  // 補完メニューを閉じる
  const handleSuggestionsClose = () => {
    setShowSuggestions(false);
  };
  
  // 音声入力（モックアップのみ）
  const handleVoiceInput = () => {
    alert('音声入力機能は現在開発中です。');
  };
  
  // 音声出力（モックアップのみ）
  const handleVoiceOutput = () => {
    alert('音声出力機能は現在開発中です。');
  };
  
  // M365サービス接続（モックアップのみ）
  const handleServiceConnect = (service: string) => {
    alert(`${service}への接続機能は現在開発中です。`);
    handleServiceMenuClose();
  };

  return (
    <Box ref={textFieldRef} sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 1, 
      width: '100%',
      fontFamily: 'Meiryo UI, Meiryo, "Segoe UI", "Hiragino Kaku Gothic ProN", Arial, sans-serif' 
    }}>
      {/* 添付ファイル表示エリア */}
      {files.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          mb: 1,
          maxHeight: '100px',
          overflowY: 'auto'
        }}>
          {files.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 0.5,
                pl: 1,
                pr: 0.5,
                borderRadius: 1,
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                fontSize: '0.75rem'
              }}
            >
              {file.type.includes('image') ? (
                <ImageIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
              ) : file.type.includes('pdf') ? (
                <PictureAsPdfIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
              ) : (
                <InsertDriveFileIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
              )}
              <Typography variant="caption" noWrap sx={{ maxWidth: '120px' }}>
                {file.name}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleRemoveFile(index)}
                sx={{ ml: 0.5, p: 0.2 }}
              >
                <Tooltip title={t('Remove')}>
                  <span style={{ fontSize: '16px', cursor: 'pointer' }}>&times;</span>
                </Tooltip>
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
        {/* メッセージ入力フィールド */}
      <TextField
        multiline
        rows={rows}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('Type a message...')}
        fullWidth
        variant="outlined"
        size="medium"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb'
          }
        }}
      />
      
      {/* 入力補完メニュー */}
      <Popover
        open={showSuggestions}
        anchorEl={anchorEl}
        onClose={handleSuggestionsClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 500,
            mt: -1,
            boxShadow: 3
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="caption" sx={{ px: 1, py: 0.5, color: 'text.secondary' }}>
            {t('入力候補')}
          </Typography>
          {suggestions.map((suggestion, index) => (
            <MenuItem 
              key={index} 
              onClick={() => handleSuggestionSelect(suggestion)}
              sx={{ borderRadius: 1 }}
            >
              {suggestion}
            </MenuItem>
          ))}
        </Box>
      </Popover>
      
      {/* 非表示のファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_FILE_TYPES}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {/* ボタンエリア */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* ユーティリティボタン */}
        <Stack direction="row" spacing={1}>
          {/* モデル選択 */}
          <Button
            size="small"
            startIcon={<TextFieldsIcon fontSize="small" />}
            endIcon={<ExpandMoreIcon fontSize="small" />}
            onClick={handleModelMenuClick}
            variant="text"
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '0.75rem'
            }}
          >
            {MODEL_OPTIONS.find(model => model.value === selectedModel)?.label || 'GPT-4.1'}
          </Button>
          
          {/* モデル選択メニュー */}
          <Menu
            anchorEl={modelAnchorEl}
            open={modelMenuOpen}
            onClose={handleModelMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            {MODEL_OPTIONS.map((model) => (
              <MenuItem 
                key={model.value} 
                onClick={() => handleModelChange(model.value)}
                selected={selectedModel === model.value}
              >
                <ListItemText>{model.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
          
          {/* 添付ファイル */}
          <Tooltip title={t('添付ファイル')}>
            <IconButton 
              size="small" 
              onClick={handleAttachmentMenuClick}
              sx={{ color: 'text.secondary' }}
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {/* 添付ファイルメニュー */}
          <Menu
            anchorEl={attachmentAnchorEl}
            open={attachmentMenuOpen}
            onClose={handleAttachmentMenuClose}
          >
            <MenuItem onClick={handleFileSelect}>
              <ListItemIcon>
                <InsertDriveFileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('ローカルファイル')}</ListItemText>
            </MenuItem>
          </Menu>
          
          {/* クラウドサービス連携 */}
          <Tooltip title={t('サービス接続')}>
            <IconButton 
              size="small" 
              onClick={handleServiceMenuClick}
              sx={{ color: 'text.secondary' }}
            >
              <CloudIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {/* サービス接続メニュー */}
          <Menu
            anchorEl={serviceAnchorEl}
            open={serviceMenuOpen}
            onClose={handleServiceMenuClose}
          >
            <MenuItem onClick={() => handleServiceConnect('OneDrive')}>
              <ListItemIcon>
                <OneDriveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>OneDrive</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleServiceConnect('SharePoint')}>
              <ListItemIcon>
                <SharePointIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>SharePoint</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleServiceConnect('Microsoft 365')}>
              <ListItemIcon>
                <Microsoft365Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Microsoft 365</ListItemText>
            </MenuItem>
          </Menu>
          
          {/* 音声入力 */}
          <Tooltip title={t('音声入力')}>
            <IconButton 
              size="small" 
              onClick={handleVoiceInput}
              sx={{ color: 'text.secondary' }}
            >
              <MicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {/* スマートスピーカー出力 */}
          <Tooltip title={t('音声出力')}>
            <IconButton 
              size="small" 
              onClick={handleVoiceOutput}
              sx={{ color: 'text.secondary' }}
            >
              <KeyboardVoiceIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {/* スマートスピーカー入力 */}
          <Tooltip title={t('スマートスピーカー入力')}>
            <IconButton 
              size="small" 
              onClick={handleVoiceInput}
              sx={{ color: 'text.secondary' }}
            >
              <HeadsetMicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        
        {/* 送信ボタン */}
        <Tooltip title={t('Press Ctrl+Enter to send')} placement="top">
          <span>
            <Button 
              variant="contained" 
              color="primary" 
              endIcon={<SendIcon />}
              onClick={handleSend} 
              sx={{ borderRadius: 2, fontWeight: 600 }}
              disabled={!input.trim()}
            >
              {t('Send')}
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>  );
};

export default ChatInput;