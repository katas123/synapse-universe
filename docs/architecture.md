# Architecture decisions

## ブラウザ版を既定にする

GitHub PagesはHTML・JS・CSSの静的ホスティングです。Python/FastAPI、Codex子プロセス、サーバーDBをその場で実行する機能はありません。端末内保存とオフライン解析に限定することで、常時起動するPCやAPIキーを必要としません。

IndexedDBはブラウザで利用できるデータベースです。Dexieのnodes・links・settingsテーブルに保存し、グラフ全体の書き込みを単一トランザクションで行います。settingsには初期化済み状態と順序だけを保存します。グラフ本体をlocalStorageには保存しません。

初期化は一度だけ実行し、書き込みを直列化します。インポート・リセット・追加中は競合する編集を止めます。インポート・リセットでは永続化成功後に画面のグラフを切り替えます。通常の編集は即時表示し、保存失敗を通知します。保存失敗時の変更はメモリに残るため、JSONに退避できます。

## デスクトップにDBを構築する場合

構築できます。単一ユーザーのローカル用途にはSQLite + FastAPIから始めるのが簡単です。複数端末の同時利用や複雑なクエリが必要になってからPostgreSQLを検討します。DBへの接続情報をブラウザに置いたり、DBポートを直接公開したりしません。

PC上でフロントエンドとFastAPIを一緒に配信する構成なら、同じPCのブラウザから利用できます。スマホから使う場合には、PCの常時起動、認証、バックアップ、HTTPSや私設VPNなどの安全な経路が必要です。GitHub PagesのHTTPS画面からHTTPの自宅PCへ直接アクセスする方法は、混在コンテンツやブラウザのプライベートネットワーク制約のため安定しません。デスクトップ版は別途設計して接続してください。

今回はデスクトップDB、端末間同期、ログイン、公開APIは実装していません。GraphRepositoryをHTTP実装へ差し替えられる境界だけ用意しています。

## Codexを接続する場合

ローカル版で次の依存方向を維持します。

```text
Browser → FastAPI限定REST API → AIProvider → CodexProvider → CodexAppServerClient
                                                                  ↓ JSONL/stdio
                                                            codex app-server
```

AnalysisProviderはフロントエンドが依存する解析の境界です。現在のDemoProviderは内蔵辞書とルールだけを使います。HTTP実装を追加する場合には、通信エラーと入力検証をサービス層に置きます。実際のCodex接続は本リポジトリの実装範囲外です。

Backendでは現行CLIから生成したスキーマを確認し、initialize・thread/start・turn/start・turn/completedを実装します。AI出力にはJSON parseとPydantic検証を必須とし、対象ノードID・強度・重複も検査します。任意RPC、ユーザーファイルの操作、shell実行を公開フロントエンドに許可しません。

## 3Dとパフォーマンス

d3-force-3dを160tickだけ実行して停止し、レイアウト計算を描画ループから切り離しています。入力グラフを直接変更せず、ロックしたノードにはfx/fy/fzを設定します。ライブラリに型定義がないため、使用するAPIのみに限定した型境界を宣言しています。

React Three Fiberは遅延読み込みし、3Dライブラリを初期UIと分離しています。スマホではBloomを省き、DPRを最大1.5に制限します。500ノードは保存形式の上限であり、その規模でのFPS保証ではありません。大規模化にはinstancing、ラベルの間引き、Web Workerでの配置計算などを実測に基づいて追加します。
