import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ja: {
    translation: {
      'AI Chat Bot': 'aichat',
      'Options': 'オプション',
      'History': '履歴',
      'Settings': '設定',
      'Send': '送信',
      'Chat History': 'スレッド',
      'New Chat': '新規チャット',
      'Type a message...': 'メッセージを入力...',
      'Bookmarks': 'ブックマーク',
      'Width': '幅',
      'Font': 'フォント',
      'Layout Settings': 'レイアウト設定',
      'Narrow': '狭い',
      'Medium': '中',
      'Wide': '広い',
      'Small': '小',
      'Large': '大',
      'Light mode': 'ライトモード',
      'Dark mode': 'ダークモード',
      'Open sidebar': 'サイドバーを開く',
      'Close sidebar': 'サイドバーを閉じる',
      'User settings': 'ユーザー設定',
      'Theme Toggle': 'テーマ切替',
      'No messages': 'メッセージなし',
      'You': 'あなた',
      'AI': 'AI',
      'Copied to clipboard': 'クリップボードにコピーしました',
      'Add to bookmarks': 'ブックマークに追加',
      'Remove from bookmarks': 'ブックマークから削除',
      'Export thread as JSON': 'JSONとしてエクスポート',
      'Share thread': 'スレッドを共有',
      'messages': 'メッセージ',
      'Guest': 'ゲスト',
      'Welcome': 'ようこそ',
      'Please login to continue': 'ログインしてください',
      'Logout': 'ログアウト',
      'Login': 'ログイン',
      'Sign up': '新規登録',
      'About': 'このアプリについて',
      'Regenerate response': '回答を再生成',
      'Download': 'ダウンロード',
      'Copy': 'コピー',
      'Feedback': 'フィードバック',
      
      // ポイント関連の翻訳追加
      'You earned 1 point for sending a message': 'メッセージ送信で1ポイント獲得しました',
      'You earned 2 points for providing feedback': 'フィードバック提供で2ポイント獲得しました',
      'You earned 5 points for logging in': 'ログインで5ポイント獲得しました',
      'You earned 50 points for signing up': '新規登録で50ポイント獲得しました',
      'You earned 3 points daily bonus': '毎日のボーナスで3ポイント獲得しました',
      'Points': 'ポイント',
      'No notifications': 'お知らせはありません',
      'Notifications': 'お知らせ'
    }
  },
  en: {
    translation: {
      'AI Chat Bot': 'AI Chat Bot',
      'Options': 'Options',
      'History': 'History',
      'Settings': 'Settings',
      'Send': 'Send',
      'Chat History': 'Chat History',
      'Type a message...': 'Type a message...'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ja',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
