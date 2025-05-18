import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ja: {
    translation: {
      'AI Chat Bot': 'AIチャットボット',
      'Options': 'オプション',
      'History': '履歴',
      'Settings': '設定',
      'Send': '送信',
      'Chat History': 'チャット履歴',
      'Type a message...': 'メッセージを入力...'
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
