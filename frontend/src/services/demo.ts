import type { KnowledgeGraph, KnowledgeNode, Category } from '../types/graph';
type Entry = {
  term: string;
  category: Category;
  summary: string;
  details: string;
  useCases: string[];
  keywords: string[];
};
const entry = (
  term: string,
  category: Category,
  summary: string,
  details: string,
  useCases: string[],
  keywords: string[],
): Entry => ({ term, category, summary, details, useCases, keywords });
export const catalogue: Entry[] = [
  entry(
    'Docker',
    'Infrastructure',
    'アプリケーションと実行環境をコンテナにまとめ、どこでも同じように動かすためのプラットフォーム。',
    'Dockerfileからイメージを構築し、イメージから隔離されたコンテナを起動します。Linuxのnamespaceとcgroupsを利用してプロセスやリソースを分離するため、仮想マシンより軽量です。イメージのレイヤー構造によって配布と再利用を効率化します。',
    [
      '開発環境をチーム全員で統一',
      'CI/CDでのビルド・テスト自動化',
      'マイクロサービスを独立してデプロイ',
    ],
    ['container', 'image', 'Dockerfile', 'Linux', 'CI/CD'],
  ),
  entry(
    'Linux',
    'Infrastructure',
    'オープンソースのカーネルを基盤とするOS。サーバーやコンテナの実行環境を支えます。',
    'プロセス管理、仮想メモリ、ファイルシステム、ネットワークをカーネルが管理します。namespaceによる隔離とcgroupsによるリソース制限は、コンテナ技術の基礎です。',
    ['Webサーバーの運用', 'コンテナの実行基盤', 'クラウドインフラの構築'],
    ['kernel', 'namespace', 'cgroups', 'Docker', 'server'],
  ),
  entry(
    'Kubernetes',
    'Infrastructure',
    'コンテナの配置・拡張・復旧を自動化するオーケストレーション基盤。',
    'Podを最小実行単位として、宣言された望ましい状態をコントローラーが維持します。スケジューラーがノードにPodを配置し、Serviceが安定した通信経路を提供します。',
    ['コンテナの自動スケーリング', '障害時の自動復旧', 'ローリングアップデート'],
    ['container', 'orchestration', 'Docker', 'cloud', 'microservices'],
  ),
  entry(
    'React',
    'Frontend',
    'コンポーネントを組み合わせてUIを構築するJavaScriptライブラリ。',
    '状態の変化からUIを宣言的に表現します。コンポーネントを分割し、propsとhooksを用いてデータと副作用を管理します。再レンダリングの差分を実際のDOMに反映します。',
    ['シングルページアプリの構築', 'ダッシュボードの実装', '再利用可能なUI部品の作成'],
    ['JavaScript', 'TypeScript', 'component', 'state', 'frontend'],
  ),
  entry(
    'TypeScript',
    'Frontend',
    'JavaScriptに静的型チェックを加え、開発時にコードの誤りを見つけやすくする言語。',
    '型注釈や型推論によって値の構造を検査し、コンパイル時にJavaScriptへ変換します。interfaceやジェネリクスで複雑なデータ構造を表現できます。型は実行時の入力検証を代替しません。',
    ['大規模なフロントエンド開発', 'APIの型定義を共有', '安全なリファクタリング'],
    ['JavaScript', 'React', 'type', 'frontend'],
  ),
  entry(
    'JavaScript',
    'Frontend',
    'ブラウザやサーバー上で動く、Webの中心的なプログラミング言語。',
    'イベントループと非同期処理によって、入出力を待ちながら他の処理を進めます。Promiseやasync/awaitが非同期の制御を支え、ブラウザではDOMを操作できます。',
    ['インタラクティブなWeb UI', 'Node.jsのサーバー開発', 'ブラウザ内のデータ処理'],
    ['TypeScript', 'React', 'Node.js', 'frontend', 'async'],
  ),
  entry(
    'Node.js',
    'Backend',
    'JavaScriptをサーバー側で実行するためのランタイム。',
    'V8エンジンとlibuvを使い、非同期I/Oとイベントループで多数の接続を扱います。CPU負荷の高い処理にはワーカースレッドなどが必要です。',
    ['REST APIサーバー', 'リアルタイム通信', '開発用CLIツール'],
    ['JavaScript', 'API', 'async', 'backend'],
  ),
  entry(
    'Python',
    'Backend',
    '読みやすい構文と豊富なライブラリを持つ汎用プログラミング言語。',
    '動的型付けの言語で、Web開発、データ分析、機械学習に広く使われます。型ヒントによる静的解析を組み合わせられ、asyncioで非同期処理を記述できます。',
    ['Web API開発', 'データ分析と機械学習', '運用作業の自動化'],
    ['FastAPI', 'API', 'async', 'data', 'backend'],
  ),
  entry(
    'FastAPI',
    'Backend',
    'Pythonの型ヒントを利用して高速にWeb APIを構築するフレームワーク。',
    'Starletteの非同期処理とPydanticの検証を組み合わせます。OpenAPIドキュメントを自動生成し、リクエストとレスポンスの構造を明示できます。',
    ['型付きREST APIの構築', 'AIモデルへのAPIブリッジ', '非同期サービスの実装'],
    ['Python', 'API', 'async', 'validation', 'backend'],
  ),
  entry(
    'PostgreSQL',
    'Data',
    '整合性と拡張性に優れた、オープンソースのリレーショナルデータベース。',
    'SQLとトランザクションを提供し、MVCCによって同時実行を制御します。JSONB、全文検索、拡張機能など、関係データ以外の用途にも対応します。',
    ['業務データの永続化', '複雑なSQL分析', 'トランザクションを伴う処理'],
    ['SQL', 'database', 'transaction', 'backend'],
  ),
  entry(
    'Redis',
    'Data',
    'メモリ上のデータ構造を利用する、高速なデータストア。',
    '文字列、ハッシュ、リスト、セットなどの構造を提供し、キャッシュやキューとして利用します。永続化方式やメモリ制限を用途に応じて設定します。',
    ['APIレスポンスのキャッシュ', 'セッション管理', 'ジョブキュー'],
    ['cache', 'database', 'backend', 'queue'],
  ),
  entry(
    'REST API',
    'Concept',
    'HTTPを通じてリソースを操作する、Webサービスの設計スタイル。',
    'URIでリソースを識別し、GET・POST・PUT・DELETEなどのHTTPメソッドで操作します。ステートレスな通信と一貫したインターフェースを重視します。',
    ['Webフロントエンドとサーバーの連携', '外部システムとの統合', 'モバイルアプリのバックエンド'],
    ['HTTP', 'API', 'FastAPI', 'Node.js', 'backend'],
  ),
  entry(
    'Git',
    'Concept',
    'コードの変更履歴を記録する、分散型バージョン管理システム。',
    '各開発者がリポジトリ全体の履歴を持ち、ブランチとコミットによって変更を管理します。差分の統合や過去への復元を安全に進められます。',
    ['チームでの共同開発', '変更履歴の追跡', '機能ごとのブランチ開発'],
    ['version', 'CI/CD', 'GitHub', 'development'],
  ),
  entry(
    'CI/CD',
    'Infrastructure',
    'コード変更の検証と配布を自動化し、継続的に改善を届ける開発プロセス。',
    'CIはビルド・テストを継続的に統合し、CDは配布可能な状態の維持や本番展開を自動化します。パイプラインはバージョン管理上のイベントを起点に実行します。',
    ['プルリクエストの自動テスト', 'コンテナイメージのビルド', '段階的な本番デプロイ'],
    ['Git', 'Docker', 'automation', 'development'],
  ),
  entry(
    'AWS',
    'Infrastructure',
    '計算・ストレージ・ネットワークなどを提供するクラウドサービス群。',
    'EC2などの仮想サーバー、S3のオブジェクトストレージ、マネージドデータベースを組み合わせます。IAMで権限を管理し、責任共有モデルに従ってセキュリティを設計します。',
    ['Webアプリのホスティング', 'データ分析基盤', 'コンテナサービスの運用'],
    ['cloud', 'server', 'Docker', 'Kubernetes', 'database'],
  ),
  entry(
    'GraphQL',
    'Concept',
    'クライアントが必要なデータの形を指定できるAPI用クエリ言語。',
    'スキーマでデータの型を定義し、リゾルバーがフィールドの値を返します。取得しすぎを避けられる一方、クエリの複雑度やN+1問題への対策が必要です。',
    ['複数リソースをまとめて取得', '複雑なフロントエンドのAPI', 'モバイルの転送量削減'],
    ['API', 'React', 'backend', 'schema'],
  ),
  entry(
    'Next.js',
    'Frontend',
    'Reactを基盤に、サーバーレンダリングやルーティングを提供するWebフレームワーク。',
    'Reactのコンポーネントモデルに、ファイルベースのルーティング、サーバーコンポーネント、静的生成などを組み合わせます。実行環境に応じてレンダリング方式を選択します。',
    ['SEOが必要なWebサイト', 'フルスタックWebアプリ', '静的なコンテンツ配信'],
    ['React', 'TypeScript', 'JavaScript', 'frontend'],
  ),
  entry(
    'Nginx',
    'Infrastructure',
    'Web配信やリバースプロキシを担う、軽量なHTTPサーバー。',
    'イベント駆動モデルで多くの接続を扱います。TLS終端、負荷分散、静的ファイル配信を行い、背後のアプリケーションサーバーへリクエストを転送します。',
    ['リバースプロキシ', 'HTTPSの終端', '静的ファイル配信'],
    ['HTTP', 'server', 'Linux', 'Docker', 'backend'],
  ),
  entry(
    'SQL',
    'Data',
    'リレーショナルデータベースのデータを検索・操作する言語。',
    'SELECTで検索し、INSERT・UPDATE・DELETEで変更します。JOIN、集約、ウィンドウ関数によって複数の表から必要なデータを構成できます。',
    ['データの検索と集計', '業務レポート作成', 'トランザクション処理'],
    ['PostgreSQL', 'database', 'transaction', 'data'],
  ),
  entry(
    'MongoDB',
    'Data',
    'JSONに似たドキュメントを扱う、ドキュメント指向データベース。',
    '柔軟なドキュメント構造とインデックス、集約パイプラインを提供します。スキーマ設計では読み書きのパターンを考慮し、埋め込みと参照を選択します。',
    ['柔軟な構造のデータ保存', 'コンテンツ管理', 'イベントデータの蓄積'],
    ['database', 'JSON', 'backend', 'data'],
  ),
  entry(
    'Terraform',
    'Infrastructure',
    'インフラ構成をコードで宣言し、作成・変更を管理するツール。',
    'プロバイダーを介してクラウドAPIを操作し、状態ファイルと実際のリソースとの差分を計画します。状態ファイルの管理と変更内容のレビューが重要です。',
    ['クラウド基盤の再現', 'インフラ変更のレビュー', '複数環境の構成管理'],
    ['AWS', 'cloud', 'automation', 'Git'],
  ),
  entry(
    'HTTP',
    'Concept',
    'クライアントとサーバーの間でリクエストとレスポンスを交換するプロトコル。',
    'メソッド、ヘッダー、ステータスコード、本文からメッセージを構成します。HTTPSはTLSで通信を暗号化し、HTTP/2やHTTP/3は転送効率を改善します。',
    ['Webページの配信', 'REST API通信', 'キャッシュの制御'],
    ['REST API', 'API', 'Nginx', 'protocol'],
  ),
  entry(
    'Three.js',
    'Frontend',
    'WebGLを使う3D描画を扱いやすくするJavaScriptライブラリ。',
    'シーン、カメラ、ジオメトリ、マテリアルを組み合わせて3D空間を構成します。React Three FiberではReactのコンポーネントとして同じシーンを表現できます。',
    ['3Dデータの可視化', 'インタラクティブな製品紹介', 'ブラウザゲーム'],
    ['JavaScript', 'React', 'frontend', 'WebGL'],
  ),
  entry(
    'IndexedDB',
    'Data',
    'ブラウザ内に構造化データを永続保存する非同期データベース。',
    'オブジェクトストアとインデックス、トランザクションを提供します。容量やデータの保持はブラウザのポリシーに依存するため、重要なデータにはバックアップも必要です。',
    ['オフラインWebアプリ', '知識グラフの保存', 'ローカルキャッシュ'],
    ['database', 'JavaScript', 'frontend', 'offline'],
  ),
];
export const specialPairs: Record<string, [number, string, string]> = {
  'Docker|Kubernetes': [
    0.94,
    'complementary',
    'Dockerなどで作成したコンテナイメージを、Kubernetesが配置・管理します。',
  ],
  'Docker|Linux': [
    0.82,
    'implementation',
    'Linuxのnamespaceとcgroupsがコンテナの隔離と制御を支えます。',
  ],
  'Docker|CI/CD': [0.87, 'ecosystem', 'CI/CDでコンテナイメージのビルドと配布を自動化します。'],
  'React|TypeScript': [
    0.92,
    'complementary',
    'ReactのコンポーネントやpropsをTypeScriptの型で検証できます。',
  ],
  'FastAPI|Python': [0.96, 'implementation', 'FastAPIはPythonの型ヒントと非同期処理を利用します。'],
  'SQL|PostgreSQL': [
    0.95,
    'implementation',
    'PostgreSQLはSQLを使ってデータの検索と操作を提供します。',
  ],
  'JavaScript|Node.js': [0.94, 'platform', 'Node.jsはJavaScriptをサーバーで実行する環境です。'],
  'React|JavaScript': [0.91, 'dependency', 'ReactはJavaScriptのライブラリです。'],
  'REST API|FastAPI': [
    0.89,
    'implementation',
    'FastAPIはREST APIを構築するための機能を提供します。',
  ],
};
export function relationsFor(node: KnowledgeNode, existing: KnowledgeNode[]) {
  return existing
    .flatMap((target) => {
      if (target.id === node.id) return [];
      const pair =
        specialPairs[node.term + '|' + target.term] ?? specialPairs[target.term + '|' + node.term];
      const shared = node.keywords.filter((k) =>
        target.keywords.some((t) => t.toLowerCase() === k.toLowerCase()),
      );
      const direct =
        node.keywords.some((k) => k.toLowerCase() === target.term.toLowerCase()) ||
        target.keywords.some((k) => k.toLowerCase() === node.term.toLowerCase());
      const strength =
        pair?.[0] ??
        (direct ? 0.76 : shared.length >= 2 ? Math.min(0.69, 0.35 + shared.length * 0.09) : 0);
      if (strength < 0.3) return [];
      return [
        {
          id: crypto.randomUUID(),
          source: node.id,
          target: target.id,
          strength,
          relationType: (pair?.[1] ?? 'related') as KnowledgeGraph['links'][number]['relationType'],
          reason:
            pair?.[2] ??
            `共通キーワード ${shared.join('・') || '技術スタック'} に基づくデモ関連です。`,
          createdAt: new Date().toISOString(),
        },
      ];
    })
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8);
}
export function makeNode(
  e: Pick<KnowledgeNode, 'term' | 'category' | 'summary' | 'details' | 'useCases' | 'keywords'>,
  index: number,
): KnowledgeNode {
  const a = index * 2.39996,
    r = 6 + index * 0.38;
  const now = new Date().toISOString();
  return {
    ...e,
    id: crypto.randomUUID(),
    position: { x: Math.cos(a) * r, y: Math.sin(index * 1.8) * 6, z: Math.sin(a) * r * 0.6 },
    positionLocked: false,
    createdAt: now,
    updatedAt: now,
  };
}
export function createInitialGraph(): KnowledgeGraph {
  const initial = [
    'Docker',
    'Linux',
    'Kubernetes',
    'React',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Python',
    'FastAPI',
    'PostgreSQL',
    'Redis',
    'REST API',
    'Git',
    'CI/CD',
    'AWS',
    'SQL',
  ];
  const nodes = initial.map((t, i) =>
    makeNode(
      catalogue.find((e) => e.term === t)!,
      i,
    ),
  );
  const links = nodes.flatMap((n, i) => relationsFor(n, nodes.slice(0, i)));
  return { version: '1.0', nodes, links };
}
export function demoEntry(term: string): Entry {
  return (
    catalogue.find((e) => e.term.toLowerCase() === term.toLowerCase()) ??
    entry(
      term,
      'Concept',
      '自分で追加した知識です。説明を編集して、学びを記録しましょう。',
      'この用語はデモ辞書に未収録です。AI解析は実行していません。右上の編集ボタンから説明・キーワードを記入できます。',
      [],
      [],
    )
  );
}
