// TypeScript用の型定義を追加
export const config = {
  apiEndpoint: 'https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_ID/completions', // 完全なエンドポイント
  apiVersion: '2023-05-15', // APIバージョン
  apiKey: 'YOUR_AZURE_API_KEY', // AzureのAPIキー
  mockMode: true, // モックモードの有効化
};

export default config;