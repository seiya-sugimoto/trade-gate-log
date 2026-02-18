# 🛡️ Trade Gate & Log

**Trade Gate & Log** は、裁量トレーダーの「無駄なエントリー」を劇的に減らし、トレードの「言語化」と「改善」を加速させるためのプロフェッショナル・ツールです。

エントリー前の厳しい関門（Gate）と、AIを活用した深い振り返り（Log）を一つのワークフローに統合しました。デザインは **Antigravity** にインスパイアされた、クリーンで集中力を高めるライトテーマを採用しています。

---

## 🚀 主な機能

### 1. 🛡️ Trade Gate (エントリー前チェック)
感情的なエントリーを未然に防ぐための強力なチェック機能です。
- **ハードストップ・ロジック**: 「団子（Dango）」「伸び切り」「不適切なリスクリワード」など、統計的に負けやすい条件を自動検知。
- **警告と摩擦 (Friction)**: リスクが高い条件では赤い警告が表示され、あえてエントリーする理由（Friction Note）を記述しない限り、保存がブロックされます。
- **言語化の強制**: 損切り根拠やエントリー理由を文字に起こすことで、根拠のないトレードを排除します。

### 2. 📝 Trade Log (履歴と分析)
日々のトレードを整理し、いつでも振り返りが可能なログ機能です。
- **ブラウザ・ローカル保存**: 全データは IndexedDB (Dexie.js) を介して、あなたのブラウザ内のみに保存されます。
- **柔軟なエクスポート**:
  - **CSV**: 表計算ソフトでの詳細な数値分析に。
  - **Markdown**: ChatGPTなどへの貼り付けや、ローカルでのドキュメント管理に最適。
- **フィルタリング**: 銘柄や結果（WIN / LOSS / BE）による素早い絞り込み。

### 3. 🧠 AI Analysis (Gemini 連携)
Google の最新 AI 「Gemini」を使用し、自分では気づけない負けパターンや傾向を客観的に分析します。
- **パターン抽出**: 過去のトレードから、うまくいっている時とそうでない時の共通点を抽出。
- **改善アクション**: 前向きな改善案をAIが提案します。
- **プライバシー配慮**: 投資助言や価格予測は行わず、あくまで「自分の行動の振り返り」に特化したプロンプト設計。

### 4. ⚙️ Settings (データとセキュリティ)
- **API Key 管理**: Gemini API Key はローカルストレージにのみ暗号化（または安全に保持）され、バックエンドには送信されません。
- **JSON バックアップ**: 全データをワンクリックでバックアップ・復元。

---

## 🛠️ 技術スタック
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Lucide-React)
- **Database**: Dexie.js (IndexedDB)
- **State Management**: Zustand
- **Visualization**: Recharts
- **AI Integration**: Google Generative AI (Gemini API)

---

## 🏁 セットアップ手順

### ローカルでの起動
1. **リポジトリのクローン**:
   ```bash
   git clone https://github.com/seiya-sugimoto/trade-gate-log.git
   cd trade-gate-log
   ```
2. **依存関係のインストール**:
   ```bash
   npm install
   ```
3. **開発サーバーの起動**:
   ```bash
   npm run dev
   ```
4. **アクセス**: ブラウザで `http://localhost:3000` を開きます。

### AI 分析の準備
1. [Google AI Studio](https://aistudio.google.com/app/apikey) で無料の Gemini API Key を取得します。
2. アプリの **Settings** メニューから取得した Key を登録してください。

---

## 🌐 デプロイ (Vercel)
このプロジェクトは Vercel に最適化されています。
1. GitHub リポジトリを Vercel にインポート。
2. Environment Variables の設定は不要（API Keyなどの秘密情報はブラウザ側で保持されるため）。
3. デプロイ完了後、すぐに使用可能です。

---

## ⚖️ 免責事項
本アプリは自身のトレードを振り返り、言語化することを支援するツールです。
- 投資助言、売買の推奨、または将来の価格を予測するものではありません。
- 投資の最終決定は、常に自身の責任において行ってください。
- 本アプリの使用によって生じたいかなる損失についても、一切の責任を負いかねます。

---
Produced by Antigravity Powered AI Assistant.
