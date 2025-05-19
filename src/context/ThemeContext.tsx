import React, { createContext, useState, useEffect, useMemo, useContext, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, PaletteMode } from '@mui/material';

// コンテンツ幅の設定タイプ
export type ContentWidthType = 'narrow' | 'medium' | 'wide';
// チャットフォントサイズの設定タイプ
export type ChatFontSizeType = 'small' | 'medium' | 'large';

type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
  contentWidth: ContentWidthType;
  setContentWidth: (width: ContentWidthType) => void;
  chatFontSize: ChatFontSizeType;
  setChatFontSize: (size: ChatFontSizeType) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
  contentWidth: 'medium',
  setContentWidth: () => {},
  chatFontSize: 'medium',
  setChatFontSize: () => {},
});

export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // ローカルストレージから取得またはデフォルト設定
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'light';
  });

  // コンテンツ幅の設定
  const [contentWidth, setContentWidth] = useState<ContentWidthType>(() => {
    const savedWidth = localStorage.getItem('contentWidth');
    return (savedWidth === 'narrow' || savedWidth === 'medium' || savedWidth === 'wide') ? 
      savedWidth as ContentWidthType : 'medium';
  });
  // チャットフォントサイズの設定
  const [chatFontSize, setChatFontSize] = useState<ChatFontSizeType>(() => {
    const savedSize = localStorage.getItem('chatFontSize');
    return (savedSize === 'small' || savedSize === 'medium' || savedSize === 'large') ? 
      savedSize as ChatFontSizeType : 'medium'; // デフォルトを'medium'に設定
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('contentWidth', contentWidth);
  }, [contentWidth]);

  useEffect(() => {
    localStorage.setItem('chatFontSize', chatFontSize);
  }, [chatFontSize]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      contentWidth,
      setContentWidth: (width: ContentWidthType) => {
        setContentWidth(width);
      },
      chatFontSize,
      setChatFontSize: (size: ChatFontSizeType) => {
        setChatFontSize(size);
      }
    }),
    [mode, contentWidth, chatFontSize]
  );

  // テーマ設定
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // ライトモードのカラー設定
                primary: {
                  main: '#1976d2',
                },
                secondary: {
                  main: '#f50057',
                },
                background: {
                  default: '#f4f6fa',
                  paper: '#ffffff',
                },
              }
            : {
                // ダークモードのカラー設定
                primary: {
                  main: '#90caf9',
                },
                secondary: {
                  main: '#f48fb1',
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
              }),
        },
        typography: {
          fontFamily: 'Meiryo UI, Meiryo, "Segoe UI", "Hiragino Kaku Gothic ProN", Arial, sans-serif',
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: mode === 'light' ? '#f1f1f1' : '#2d2d2d',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: mode === 'light' ? '#c1c1c1' : '#6b6b6b',
                  borderRadius: '4px',
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={colorMode}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
