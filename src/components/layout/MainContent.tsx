import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, Typography, Paper, Avatar, IconButton, Tooltip, Snackbar, 
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import api from '../../services/api';
import ChatInput from '../chat/ChatInput';
import ReactMarkdown from 'react-markdown';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareIcon from '@mui/icons-material/Share';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import DownloadIcon from '@mui/icons-material/Download'; // JSONエクスポート用アイコン
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../../types/chat';
import MessageActions from '../chat/MessageActions';
import FeedbackDialog, { FeedbackData } from '../chat/FeedbackDialog';
import { usePoints } from '../../context/PointsContext';
import { useTheme } from '../../context/ThemeContext';
import { useChatContext } from '../../context/ChatContext';

const MainContent: React.FC = () => {
  const { t } = useTranslation();
  const { addPoints } = usePoints();
  const { mode } = useTheme();  const { 
    threads, 
    activeThreadId, 
    addMessage,
    toggleBookmark,
    shareThread,
    regenerateMessage,
    exportThreadsToJSON,
    exportThreadToMarkdown,
    exportThreadToPDF,
    exportThreadToWord
  } = useChatContext();
    // アクティブなスレッドを取得
  const activeThread = React.useMemo(() => threads.find(thread => thread.id === activeThreadId), [threads, activeThreadId]);
  const messages = React.useMemo(() => activeThread?.messages || [], [activeThread]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  // スクロールを常に最新に
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // コードをクリップボードにコピー
  const copyToClipboard = (text: string, id: string = 'code') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    
    setSnackbarSeverity('success');
    setSnackbarMessage(t('Copied to clipboard'));
    setSnackbarOpen(true);
    
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (message: string) => {
    if (!activeThreadId) return;
    
    const newMessageId = `${Date.now()}`;
    const userMessage: Message = { 
      id: newMessageId, 
      role: 'user', 
      content: message, 
      timestamp: Date.now() 
    };
    
    // ユーザーメッセージをスレッドに追加
    addMessage(activeThreadId, userMessage);    // チャットメッセージ送信でポイント獲得
    addPoints({
      type: 'chat',
      points: 1,
      message: 'メッセージ送信で1ポイント獲得しました'
    });
    
    // APIから応答取得
    try {
      const res = await api.sendMessage(message) as any;
      const aiMessage: Message = { 
        id: `${Date.now()}-ai`, 
        role: 'assistant', 
        content: res.content, 
        timestamp: Date.now() 
      };
      
      // AI応答をスレッドに追加
      addMessage(activeThreadId, aiMessage);
    } catch (error) {
      console.error('APIリクエストエラー:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(t('Failed to get response from AI'));
      setSnackbarOpen(true);
    }
  };

  // スレッド共有機能
  const handleShare = async () => {
    if (!activeThreadId) {
      setSnackbarSeverity('error');
      setSnackbarMessage(t('No active thread to share'));
      setSnackbarOpen(true);
      return;
    }
    
    try {
      const shareData = await shareThread(activeThreadId);
      
      // クリップボードにURLをコピー
      navigator.clipboard.writeText(shareData.url);
      
      setSnackbarSeverity('success');
      setSnackbarMessage(t('Thread shared and URL copied to clipboard'));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('スレッド共有エラー:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(t('Failed to share thread'));
      setSnackbarOpen(true);
    }
  };

  // JSONエクスポート機能
  const handleExportJSON = async () => {
    if (!activeThreadId) {
      setSnackbarSeverity('error');
      setSnackbarMessage(t('No active thread to export'));
      setSnackbarOpen(true);
      return;
    }
    
    try {
      // 現在のスレッドのみをエクスポート
      const jsonData = await exportThreadsToJSON([activeThreadId]);
      
      // Blobオブジェクトを作成
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // ダウンロードリンクを作成
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // ファイル名を設定（スレッドタイトルベース）
      const fileName = `${activeThread?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat'}_${Date.now()}.json`;
      
      link.href = url;
      link.download = fileName;
      
      // リンクをクリックしてダウンロード
      document.body.appendChild(link);
      link.click();
      
      // クリーンアップ
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSnackbarSeverity('success');
      setSnackbarMessage(t('Thread exported successfully'));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('JSONエクスポートエラー:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(t('Failed to export thread'));
      setSnackbarOpen(true);
    }
  };
  
  // Markdown形式でエクスポート
  const handleExportMarkdown = async () => {
    if (!activeThreadId) return;
    
    try {
      const markdown = await exportThreadToMarkdown(activeThreadId);
      
      // Blobオブジェクトを作成
      const blob = new Blob([markdown], { type: 'text/markdown' });
      
      // ダウンロードリンクを作成
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // ファイル名を設定
      const fileName = `${activeThread?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat'}_${Date.now()}.md`;
      
      link.href = url;
      link.download = fileName;
      
      // リンクをクリックしてダウンロード
      document.body.appendChild(link);
      link.click();
      
      // クリーンアップ
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSnackbarSeverity('success');
      setSnackbarMessage(t('Exported as Markdown'));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Markdownエクスポートエラー:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(t('Failed to export as Markdown'));
      setSnackbarOpen(true);
    }
  };
  
  // PDF形式でエクスポート
  const handleExportPDF = async () => {
    if (!activeThreadId) return;
    
    try {
      const pdfBlob = await exportThreadToPDF(activeThreadId);
      
      // ダウンロードリンクを作成
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      
      // ファイル名を設定
      const fileName = `${activeThread?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat'}_${Date.now()}.pdf`;
      
      link.href = url;
      link.download = fileName;
      
      // リンクをクリックしてダウンロード
      document.body.appendChild(link);
      link.click();
      
      // クリーンアップ
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSnackbarSeverity('success');
      setSnackbarMessage(t('Exported as PDF'));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('PDFエクスポートエラー:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(t('Failed to export as PDF'));
      setSnackbarOpen(true);
    }
  };
  
  // Word形式でエクスポート
  const handleExportWord = async () => {
    if (!activeThreadId) return;
    
    try {
      const wordBlob = await exportThreadToWord(activeThreadId);
      
      // ダウンロードリンクを作成
      const url = URL.createObjectURL(wordBlob);
      const link = document.createElement('a');
      
      // ファイル名を設定
      const fileName = `${activeThread?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat'}_${Date.now()}.docx`;
      
      link.href = url;
      link.download = fileName;
      
      // リンクをクリックしてダウンロード
      document.body.appendChild(link);
      link.click();
      
      // クリーンアップ
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSnackbarSeverity('success');
      setSnackbarMessage(t('Exported as Word'));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Wordエクスポートエラー:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(t('Failed to export as Word'));
      setSnackbarOpen(true);
    }
  };
  
  // ブックマーク切り替え
  const handleToggleBookmark = () => {
    if (!activeThreadId) return;
    toggleBookmark(activeThreadId);
    
    setSnackbarSeverity('success');
    setSnackbarMessage(activeThread?.isBookmarked 
      ? t('Removed from bookmarks') 
      : t('Added to bookmarks'));
    setSnackbarOpen(true);
  };
  
  // メッセージ再生成機能
  const handleRegenerateMessage = async (messageId: string) => {
    if (!activeThreadId) return;
    
    try {
      await regenerateMessage(activeThreadId, messageId);
      setSnackbarSeverity('success');
      setSnackbarMessage(t('Message regenerated'));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('メッセージ再生成エラー:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(t('Failed to regenerate message'));
      setSnackbarOpen(true);
    }
  };
  
  // フィードバックダイアログを開く
  const handleFeedback = (messageId: string) => {
    setSelectedMessageId(messageId);
    setFeedbackDialogOpen(true);
  };
  
  // フィードバック送信処理
  const handleFeedbackSubmit = (data: FeedbackData) => {
    console.log('Feedback submitted:', data);
      // フィードバック送信でポイント獲得
    addPoints({
      type: 'feedback',
      points: 2,
      message: 'フィードバック提供で2ポイント獲得しました'
    });
    
    setSnackbarSeverity('success');
    setSnackbarMessage(t('Thank you for your feedback!'));
    setSnackbarOpen(true);
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Markdownレンダリングのカスタマイズ（コードブロック）
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const code = String(children).replace(/\n$/, '');
      const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
      
      return !inline && match ? (
        <Box sx={{ position: 'relative', my: 1 }}>
          <Tooltip title={copiedId === codeId ? t('Copied!') : t('Copy code')} placement="top">
            <IconButton
              size="small"
              onClick={() => copyToClipboard(code, codeId)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{ borderRadius: '4px', fontSize: '0.9rem' }}
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  // チャット開始日時
  const chatStartDate = messages.length > 0 ? new Date(messages[0].timestamp) : new Date();  // コンテンツ幅とフォントサイズの設定
  const { contentWidth, chatFontSize } = useTheme();
  
  // コンテンツ幅の値をピクセルに変換
  const getContentMaxWidth = () => {
    switch(contentWidth) {
      case 'narrow': return '700px';
      case 'medium': return '900px';  // デフォルト値を広げた
      case 'wide': return '1100px';
      default: return '900px';
    }
  };
    // チャットの文字サイズの値をremに変換
  const getChatFontSize = () => {
    switch(chatFontSize) {
      case 'small': return '0.8rem';
      case 'medium': return '0.9rem';  // ミディアムサイズを小さくする
      case 'large': return '1.05rem';
      default: return '0.9rem';
    }
  };
  
  // フォントサイズに応じた行間を取得
  const getLineHeight = () => {
    switch(chatFontSize) {
      case 'small': return 1.4;  // 小さいサイズでは行間も狭く
      case 'medium': return 1.5;
      case 'large': return 1.6;  // 大きいサイズでは行間も広く
      default: return 1.5;
    }
  };
  
  // フォントサイズに応じた余白サイズを取得
  const getMessageSpacing = () => {
    switch(chatFontSize) {
      case 'small': return { py: 1.5, paragraphMargin: 1 }; // 小さいフォントでは余白も小さく
      case 'medium': return { py: 2, paragraphMargin: 1.5 };
      case 'large': return { py: 2.5, paragraphMargin: 2 };
      default: return { py: 2, paragraphMargin: 1.5 };
    }
  };
  
  return (
    <Box
      className="main-content"
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        pt: { xs: 1, sm: 2, md: 3 },
        pl: { xs: 1, sm: 2, md: 3 },
        pr: { xs: 1, sm: 2, md: 3 },
        pb: 0,
        fontSize: getChatFontSize(), // チャット全体のフォントサイズを設定
      }}
    >
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        maxWidth: getContentMaxWidth(), // コンテンツ幅を動的に設定
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
            {activeThread?.title || t('New Chat')}          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>            
            <Tooltip title={activeThread?.isBookmarked ? t('Remove from bookmarks') : t('Add to bookmarks')}>
              <IconButton 
                size="small" 
                onClick={handleToggleBookmark} 
                color={activeThread?.isBookmarked ? "warning" : "default"}
              >
                {activeThread?.isBookmarked ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Export thread as JSON')}>
              <IconButton size="small" onClick={handleExportJSON}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('Share thread')}>
              <IconButton size="small" onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {format(chatStartDate, 'yyyy/MM/dd HH:mm')} · {messages.length} {t('messages')}
        </Typography>
      </Box>      <Paper 
        ref={scrollRef} 
        elevation={0}
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto', 
          bgcolor: 'background.paper',
          p: 0,
          maxWidth: getContentMaxWidth(),
          margin: '0 auto',
          width: '100%',
          minWidth: 0,
          minHeight: 0, // Add this line
          boxSizing: 'border-box',
          borderRadius: 0,
        }}
      >        {messages.map((msg: any) => (
          <Box 
            key={msg.id} 
            sx={{ 
              py: getMessageSpacing().py, // フォントサイズに応じて上下パディングを調整
              px: 3,
              bgcolor: (theme: any) => msg.role === 'assistant' ? 
                (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)') : 
                'transparent',
              borderBottom: (theme: any) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              minWidth: 0,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 2, 
              maxWidth: '100%',
              mx: 'auto'
            }}>
              <Avatar 
                sx={{ 
                  bgcolor: msg.role === 'user' 
                    ? mode === 'dark' ? 'primary.dark' : 'primary.main' 
                    : mode === 'dark' ? 'success.dark' : 'success.main', 
                  width: 36, 
                  height: 36 
                }}
              >
                {msg.role === 'user' ? 'G' : <SmartToyIcon />}
              </Avatar>

              <Box sx={{ flex: 1 }}>                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ fontWeight: 500 }}
                  >
                    {msg.role === 'user' ? t('You') : t('AI')}
                  </Typography>
                  {/* 日時の重複表示を修正（下部分のみに表示） */}
                </Box>                <Box sx={{ 
                  fontSize: 'inherit', // 親コンポーネントから継承
                  lineHeight: getLineHeight(), // フォントサイズに応じた行間を設定
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                  '& p': { mb: getMessageSpacing().paragraphMargin }, // フォントサイズに応じた段落間の余白
                  '& ul, & ol': { pl: chatFontSize === 'small' ? 2 : 2.5, mb: getMessageSpacing().paragraphMargin },
                  '& li': { mb: chatFontSize === 'small' ? 0.3 : 0.5 },
                  '& pre': { 
                    mb: chatFontSize === 'small' ? 1.5 : 2, 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word', 
                    overflowX: 'auto', 
                    maxWidth: '100%', 
                    minWidth: 0, 
                    width: '100%', 
                    boxSizing: 'border-box' 
                  },
                  '& code:not(pre *)': {
                    px: chatFontSize === 'small' ? 0.6 : 0.8,
                    py: chatFontSize === 'small' ? 0.2 : 0.3,
                    mx: 0.2,
                    borderRadius: 1,
                    fontSize: '0.85em', // emを使用して相対サイズ指定
                    fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                    color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                    wordBreak: 'break-word',
                  },
                }}>
                  <ReactMarkdown components={components}>{msg.content}</ReactMarkdown>
                </Box>                {msg.role === 'user' ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: chatFontSize === 'small' ? 1 : 1.5, // フォントサイズが小さい場合は余白も小さく
                    color: 'text.secondary'
                  }}>
                    <Typography variant="caption">
                      {format(new Date(msg.timestamp), 'yyyy/MM/dd HH:mm')}
                    </Typography>
                    
                    <Tooltip title={t('Regenerate response')}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRegenerateMessage(msg.id)}
                        sx={{ p: 0.5 }}
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (                  <MessageActions
                    messageId={msg.id}
                    timestamp={msg.timestamp}
                    content={msg.content}
                    onCopy={copyToClipboard}
                    onShare={handleShare}
                    onFeedback={() => handleFeedback(msg.id)}
                    onExportMarkdown={handleExportMarkdown}
                    onExportPDF={handleExportPDF}
                    onExportWord={handleExportWord}
                  />
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Paper>
      <Box sx={{        flexShrink: 0,
        p: 2,
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        bgcolor: 'background.paper',
        // borderBottomLeftRadius, borderBottomRightRadius の重複を削除
        borderRadius: '0 0 6px 6px',
        maxWidth: getContentMaxWidth(),
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        mb: 0,
      }}>
        <ChatInput onSendMessage={handleSendMessage} />
      </Box>

      {/* フィードバックダイアログ */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        messageId={selectedMessageId}
        onSubmit={handleFeedbackSubmit}
      />      {/* スナックバー通知 */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainContent;