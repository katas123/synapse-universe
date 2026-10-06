import { useEffect, useState, lazy, Suspense } from 'react';
import {
  Search,
  Plus,
  Settings,
  ArrowUpRight,
  X,
  RotateCcw,
  Move,
  Orbit,
  Network,
  BookOpen,
  ChevronRight,
  Maximize,
  Check,
  LoaderCircle,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import Brand from './components/layout/Brand';
import NodeDetailPanel from './components/panels/NodeDetailPanel';
import SettingsPanel from './components/panels/SettingsPanel';
import { useGraph } from './stores/graphStore';
import { categories, colors } from './types/graph';
import { catalogue } from './services/demo';
const KnowledgeGraph = lazy(() => import('./components/KnowledgeGraph'));
const names: Record<string, string> = {
  Infrastructure: 'インフラ',
  Frontend: 'フロントエンド',
  Backend: 'バックエンド',
  Data: 'データ',
  Concept: 'コンセプト',
};
export default function App() {
  const { graph, ready, busy, stage, error, saving, stored, selectedId, select, add, clearError } =
    useGraph();
  const [query, setQuery] = useState(''),
    [searchOpen, setSearchOpen] = useState(false),
    [category, setCategory] = useState<string | null>(null),
    [view, setView] = useState<'graph' | 'library'>('graph'),
    [settings, setSettings] = useState(false),
    [labels, setLabels] = useState(true),
    [motion, setMotion] = useState(true),
    [reset, setReset] = useState(0),
    [legend, setLegend] = useState(false);
  useEffect(() => {
    void useGraph.getState().init();
  }, []);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSettings(false);
        setSearchOpen(false);
        select(null);
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  const selected = graph.nodes.find((n) => n.id === selectedId);
  const matches = graph.nodes
    .filter((n) => n.term.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);
  const exact = graph.nodes.some((n) => n.term.toLowerCase() === query.trim().toLowerCase());
  const suggestions = catalogue
    .filter((n) => !graph.nodes.some((x) => x.term === n.term))
    .slice(0, 4);
  function focus(id: string) {
    select(id);
    setCategory(null);
    setView('graph');
    setSearchOpen(false);
    setQuery('');
  }
  async function submit(term = query) {
    setSearchOpen(false);
    const existing = graph.nodes.find((n) => n.term.toLowerCase() === term.trim().toLowerCase());
    if (existing) {
      focus(existing.id);
      return;
    }
    await add(term.slice(0, 100));
    setQuery('');
    setView('graph');
    setCategory(null);
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-name">
          <span className="workspace-avatar">S</span>
          <div>
            My Knowledge Universe<small>PERSONAL WORKSPACE</small>
          </div>
          <span className="live-dot" />
        </div>
        <div className="sidebar-section">EXPLORE</div>
        <nav>
          <button
            className={view === 'graph' ? 'nav-item active' : 'nav-item'}
            onClick={() => setView('graph')}
          >
            <Network size={18} /> 知識宇宙 <span className="nav-shortcut">01</span>
          </button>
          <button
            className={view === 'library' ? 'nav-item active' : 'nav-item'}
            onClick={() => setView('library')}
          >
            <BookOpen size={18} /> 知識一覧 <span className="nav-count">{graph.nodes.length}</span>
          </button>
        </nav>
        <div className="sidebar-section categories-title">
          CATEGORIES <span>{categories.length}</span>
        </div>
        <div className="category-nav">
          <button className={!category ? 'selected' : ''} onClick={() => setCategory(null)}>
            <Compass size={15} />
            <span>すべての知識</span>
            <small>{graph.nodes.length}</small>
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? 'selected' : ''}
              onClick={() => setCategory(category === c ? null : c)}
            >
              <span className="dot" style={{ background: colors[c] }} />
              <span>{names[c]}</span>
              <small>{graph.nodes.filter((n) => n.category === c).length}</small>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="growth-card">
            <span className="eyebrow">A LITTLE, EVERY DAY</span>
            <p>
              ひとつの学びから、
              <br />
              宇宙が広がる。
            </p>
            <div className="mini-orbits">
              <Orbit size={46} strokeWidth={0.6} />
              <span />
            </div>
          </div>
          <button className="nav-item" onClick={() => setSettings(true)}>
            <Settings size={17} /> 設定とバックアップ
          </button>
          <div className="local-status">
            <span className="live-dot" />
            LOCAL-FIRST <span>v0.1 demo</span>
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="breadcrumb">
            Workspace <ChevronRight size={12} /> <span>Knowledge Universe</span>
          </div>
          <div className="header-right">
            <span className="save-status">
              {saving ? (
                <LoaderCircle size={13} className="spin" />
              ) : stored ? (
                <Check size={13} />
              ) : (
                <span />
              )}
              {saving ? '保存中' : stored ? 'ローカルに保存済み' : '保存待ち'}
            </span>
            <button className="demo-status" onClick={() => setSettings(true)}>
              <span className="live-dot" /> DEMO MODE
            </button>
            <button className="avatar" title="設定" onClick={() => setSettings(true)}>
              S
            </button>
          </div>
        </header>
        <section className="universe-heading">
          <div>
            <div className="eyebrow">CONNECT WHAT YOU KNOW</div>
            <h1>
              あなたの知識が、<span>宇宙になる。</span>
            </h1>
            <p>学びを星に。つながりを、新しい発見に。</p>
          </div>
          <div className="headline-stats">
            <div>
              <strong>{String(graph.nodes.length).padStart(2, '0')}</strong>
              <span>KNOWLEDGE</span>
            </div>
            <span className="stats-divider" />
            <div>
              <strong>{String(graph.links.length).padStart(2, '0')}</strong>
              <span>CONNECTIONS</span>
            </div>
          </div>
        </section>
        <div className="workspace-toolbar">
          <div className="view-tabs">
            <button className={view === 'graph' ? 'active' : ''} onClick={() => setView('graph')}>
              <Network size={15} /> 宇宙マップ
            </button>
            <button
              className={view === 'library' ? 'active' : ''}
              onClick={() => setView('library')}
            >
              <BookOpen size={15} /> 知識一覧
            </button>
          </div>
          <div className="toolbar-end">
            <span className="demo-description">内蔵辞書によるデモ解析</span>
            <button
              className={'icon-button ' + (legend ? 'on' : '')}
              title="カテゴリと表示設定"
              onClick={() => setLegend(!legend)}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
        <div className="graph-workspace">
          <div className={'graph-container ' + (selected ? 'has-selection' : '')}>
            {view === 'graph' ? (
              ready ? (
                <Suspense fallback={<div className="canvas-loading">3D宇宙を読み込み中…</div>}>
                  <KnowledgeGraph
                    category={category}
                    labels={labels}
                    motion={motion}
                    reset={reset}
                  />
                </Suspense>
              ) : (
                <div className="canvas-loading">
                  <Orbit className="spin" />
                  宇宙を準備しています…
                </div>
              )
            ) : (
              <div className="library">
                {graph.nodes
                  .filter((n) => !category || n.category === category)
                  .map((n) => (
                    <button className="library-card" key={n.id} onClick={() => focus(n.id)}>
                      <span className="library-star" style={{ color: colors[n.category] }}>
                        <Orbit size={27} />
                      </span>
                      <span className="library-content">
                        <small>{n.category}</small>
                        <strong>{n.term}</strong>
                        <span>{n.summary}</span>
                      </span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                {graph.nodes.length === 0 && <p className="muted">最初の知識を追加しましょう。</p>}
              </div>
            )}
            <div className="search-area">
              <form
                className={'search-box ' + (busy ? 'analyzing' : '')}
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
              >
                <Search size={19} />
                <input
                  aria-label="知識を検索・追加"
                  maxLength={100}
                  value={query}
                  disabled={busy || !ready}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="知識を検索、または新しく追加…"
                />
                <button
                  className="add-button"
                  title="知識を追加"
                  aria-label="知識を追加"
                  disabled={busy || !query.trim() || !ready}
                  type="submit"
                >
                  {busy ? <LoaderCircle size={18} className="spin" /> : <Plus size={20} />}
                </button>
              </form>
              {searchOpen && query && (
                <div className="autocomplete">
                  {matches.map((n) => (
                    <button key={n.id} onClick={() => focus(n.id)}>
                      <span className="dot" style={{ background: colors[n.category] }} />
                      <span>{n.term}</span>
                      <small>宇宙で見つける</small>
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                  {!exact && (
                    <button className="new-term" disabled={busy} onClick={() => void submit()}>
                      <Plus size={15} />
                      <span>「{query}」を追加</span>
                      <small>
                        {catalogue.some((n) => n.term.toLowerCase() === query.toLowerCase())
                          ? 'デモ辞書'
                          : '手動ノート'}
                      </small>
                    </button>
                  )}
                </div>
              )}
              {!query && !busy && (
                <div className="suggestions">
                  <span>宇宙を広げる</span>
                  {suggestions.map((n) => (
                    <button key={n.term} disabled={busy} onClick={() => void submit(n.term)}>
                      <Plus size={10} />
                      {n.term}
                    </button>
                  ))}
                </div>
              )}
              {busy && (
                <div className="analysis-progress" role="status">
                  <span className="live-dot" />
                  {stage}
                </div>
              )}
            </div>
            {legend && (
              <div className="graph-settings">
                <div className="section-label">CATEGORIES</div>
                <button className={!category ? 'active' : ''} onClick={() => setCategory(null)}>
                  すべて表示
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    className={category === c ? 'active' : ''}
                    onClick={() => setCategory(category === c ? null : c)}
                  >
                    <span className="dot" style={{ background: colors[c] }} />
                    {names[c]}
                  </button>
                ))}
                <hr />
                <label>
                  <input
                    type="checkbox"
                    checked={labels}
                    onChange={(e) => setLabels(e.target.checked)}
                  />{' '}
                  ラベルを表示
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={motion}
                    onChange={(e) => setMotion(e.target.checked)}
                  />{' '}
                  アニメーション
                </label>
              </div>
            )}
            {graph.nodes.length === 0 && ready && view === 'graph' && (
              <div className="empty-state">
                <Orbit size={48} />
                <h2>最初の星を、生み出そう。</h2>
                <p>上の入力欄に「Docker」と入力してください。</p>
              </div>
            )}
            {view === 'graph' && (
              <>
                <div className="canvas-caption">
                  <span className="live-dot" /> YOUR KNOWLEDGE, CONNECTED{' '}
                  <span className="caption-line" />
                </div>
                <div className="graph-controls">
                  <button
                    title="宇宙全体を表示"
                    onClick={() => {
                      select(null);
                      setCategory(null);
                      setReset((r) => r + 1);
                    }}
                  >
                    <Maximize size={18} />
                  </button>
                  <button
                    title="表示をリセット"
                    onClick={() => {
                      select(null);
                      setReset((r) => r + 1);
                    }}
                  >
                    <RotateCcw size={17} />
                  </button>
                  <button title="表示設定" onClick={() => setLegend(!legend)}>
                    <Settings size={17} />
                  </button>
                </div>
                <div className="canvas-bottom">
                  <div className="interaction-hint">
                    <Move size={13} />
                    <span>ドラッグで回転</span>
                    <span className="hint-dot">·</span>
                    <span>ピンチでズーム</span>
                  </div>
                  <span className="graph-dimension">
                    3D SPACE <span>XYZ</span>
                  </span>
                </div>
              </>
            )}
          </div>
          {selected && <NodeDetailPanel node={selected} onClose={() => select(null)} />}
        </div>
        <footer className="footer">
          <span>
            <span className="tiny-star">✧</span> Every connection is a new possibility.
          </span>
          <button onClick={() => setSettings(true)}>
            端末内に保存 <ArrowUpRight size={12} />
          </button>
        </footer>
      </main>
      {error && (
        <div className="toast" role="alert">
          <span>{error}</span>
          <button className="icon-button" title="閉じる" onClick={clearError}>
            <X size={16} />
          </button>
        </div>
      )}
      {settings && <SettingsPanel close={() => setSettings(false)} />}
    </div>
  );
}
