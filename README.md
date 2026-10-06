# Synapse Universe

学習したIT技術を星として保存し、技術同士のつながりを3D空間で探索する、スマホ対応Webアプリです。

- アプリ: https://katas123.github.io/synapse-universe/
- ソース: https://github.com/katas123/synapse-universe

GitHub Pagesで静的ファイルを配信します。知識グラフは訪問者のブラウザ内のIndexedDBに保存され、GitHubへの送信や端末間の自動同期はありません。解析は内蔵辞書を使うデモ方式で、Codex・有料AI API・サーバーDBは接続していません。

## 動作要件

- Node.js 22.12以上 / npm
- WebGLとIndexedDBを利用できる最新版のChrome、Safari、Firefox、Edge
- Python、Codex CLI、APIキーは不要

## ローカル開発

```bash
git clone https://github.com/katas123/synapse-universe.git
cd synapse-universe
npm ci
npm run dev
```

表示されたURLをPCで開きます。同じWi-Fiに接続したスマホで確認するときは、PCのLANアドレスと表示ポートを使います。開発用サーバーのインターネット公開は不要です。

```bash
npm run check       # TypeScript、テスト、整形チェック
npm run format      # コード整形
npm run build       # dist/ に配布物を生成
npm run preview     # 配布物のローカル確認
```

依存関係はpackage-lock.jsonで固定し、開発・CIともにnpm ciで再現します。

## 主な機能

- カテゴリごとの発光ノード、関連度に応じた線、3D回転とピンチズーム
- 用語の検索と登録、詳細表示・編集、関連ノードへの滑らかなフォーカス
- 選択ノードと隣接ノードの強調、カテゴリ絞り込み、知識一覧
- d3-force-3dによる配置、ドラッグした位置の固定
- IndexedDB自動保存・復元、JSONバックアップ、追加／置換インポート
- スマホではBloomを無効化、描画解像度は最大1.5倍に制限

初回は16のノードを表示します。内蔵辞書は24語です。未収録語は手動ノートになり、説明・関連をAIが生成したようには表示しません。関連度は内蔵ルールに基づく表示用の値で、AIの確信度ではありません。

## GitHub Pagesへの公開

1. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にします。
2. mainブランチにpushします。
3. **Actions → Verify and deploy GitHub Pages** の成功を確認します。
4. 上記アプリURLを開きます。

公開の空リポジトリから始める場合:

```bash
gh auth login
gh repo create synapse-universe --public --source=. --remote=origin
git push -u origin main
gh api --method POST repos/OWNER/synapse-universe/pages -f build_type=workflow
```

OWNERは自分のGitHubユーザー名に置き換えます。Pagesが既に有効なら最後のPOSTは不要です。main更新時と手動実行時にデプロイし、プルリクエストではチェック・ビルドのみ実行します。公開用権限はdeployジョブに限定しています。

Viteのbaseは `./` です。JS・CSS・faviconは相対URLを使い、GitHub Pagesの `/synapse-universe/` 配下でも動作します。ビルド結果や秘密情報はコミットしません。

## データの移行・保持

旧Sites版とGitHub Pages版はドメインが異なるため、保存領域を共有しません。

1. 旧サイトで **設定 → JSONを書き出す**。
2. Pages版で **設定 → JSONを読み込む**。
3. 「既存の知識に追加」または「全体を置き換え」を選びます。

全体置換とリセットの前にはバックアップしてください。インポートはサイズ・スキーマ・重複・参照先・関連度を検証してから、トランザクションで保存します。無効データや保存失敗では既存の知識を置き換えません。上限は5MB、500ノード、3000リンクです。

ブラウザのデータ削除やプライベートモード終了、容量不足によってIndexedDBは消えることがあります。永続的なバックアップにはJSONを使ってください。GitHub Pagesは公開サイトですが、訪問者それぞれのグラフはそのブラウザに保存されます。

## 構成と拡張

```text
frontend/src/
  App.tsx                         # 画面構成と検索・表示状態
  components/
    layout/Brand.tsx
    panels/NodeDetailPanel.tsx
    panels/SettingsPanel.tsx
    KnowledgeGraph.tsx             # 3D描画、カメラ、ドラッグ
  types/graph.ts                   # ドメイン型・Zod入力検証
  stores/graphStore.ts             # アプリ状態、保存順序・競合制御
  services/
    analysis.ts                   # 解析プロバイダーの境界
    demo.ts                       # 内蔵辞書・関連ルール
    layout.ts                     # 描画に依存しない配置計算
  db/
    repository.ts                 # 保存インターフェース
    database.ts                   # Dexieトランザクション
.github/workflows/pages.yml        # チェックと自動デプロイ
```

保存処理と解析処理は注入可能です。テストでは実ブラウザの保存領域に触れず、メモリ上の実装やfake-indexeddbを使います。Codex RPCの詳細を画面やドメインへ混在させない構成です。将来の構成判断は [docs/architecture.md](docs/architecture.md) を参照してください。

## トラブルシューティング

- **Pagesが404:** Actionsの成功、Settings → PagesのSource、公開URL末尾の `/` を確認。
- **保存できない:** プライベートモード・端末容量・ブラウザの設定を確認。JSONで退避。
- **別の端末で知識が見えない:** 自動同期はありません。JSONで移行。
- **3Dが動かない:** WebGL対応ブラウザへ更新するか「知識一覧」で閲覧。
- **インポートできない:** このアプリから出力したバージョン1.0のJSONか確認。
- **Codexで解析されない:** 現在はオフラインデモです。サーバーとの接続機能は未実装。

端末ごとの30 FPSは実測保証していません。大きなグラフではカテゴリ絞り込みやラベル非表示を利用してください。
