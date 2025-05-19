/// <reference types="react-scripts" />

// JSONファイルをインポート可能に
declare module "*.json" {
  const value: any;
  export default value;
}

export {};
