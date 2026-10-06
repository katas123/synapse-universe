import { useEffect, useState, type CSSProperties } from 'react';
import { Pencil, X, Orbit, Check, ArrowUpRight } from 'lucide-react';
import { useGraph } from '../../stores/graphStore';
import { colors, type KnowledgeNode } from '../../types/graph';
export default function NodeDetailPanel({
  node,
  onClose,
}: {
  node: KnowledgeNode;
  onClose: () => void;
}) {
  const graph = useGraph((s) => s.graph),
    select = useGraph((s) => s.select),
    edit = useGraph((s) => s.edit),
    [editing, setEditing] = useState(false),
    [summary, setSummary] = useState(node.summary),
    [details, setDetails] = useState(node.details),
    [keywords, setKeywords] = useState(node.keywords.join(', '));
  useEffect(() => {
    setEditing(false);
    setSummary(node.summary);
    setDetails(node.details);
    setKeywords(node.keywords.join(', '));
  }, [node.id]);
  const connections = graph.links
    .filter((l) => l.strength >= 0.3 && (l.source === node.id || l.target === node.id))
    .map((l) => ({
      ...l,
      targetNode: graph.nodes.find((n) => n.id === (l.source === node.id ? l.target : l.source))!,
    }))
    .sort((a, b) => b.strength - a.strength);
  return (
    <aside className="detail">
      <div className="mobile-handle" />
      <div className="panel-top">
        <span>KNOWLEDGE INSIGHT</span>
        <div>
          <button className="icon-button" title="説明を編集" onClick={() => setEditing(!editing)}>
            <Pencil size={15} />
          </button>
          <button className="icon-button" title="閉じる" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="detail-scroll">
        <div
          className="detail-star"
          style={{ '--node-color': colors[node.category] ?? colors.Concept } as CSSProperties}
        >
          <span />
          <Orbit size={72} strokeWidth={0.55} />
        </div>
        <div className="category-pill" style={{ color: colors[node.category] }}>
          <span className="dot" style={{ background: colors[node.category] }} />
          {node.category}
        </div>
        <h2>{node.term}</h2>
        {editing ? (
          <form
            className="edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              edit(node.id, {
                summary,
                details,
                keywords: keywords
                  .split(/[,、]/)
                  .map((s) => s.trim().slice(0, 100))
                  .filter(Boolean)
                  .slice(0, 30),
              });
              setEditing(false);
            }}
          >
            <label>
              概要
              <textarea
                maxLength={20000}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </label>
            <label>
              詳細
              <textarea
                maxLength={20000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </label>
            <label>
              キーワード（カンマ区切り）
              <input
                maxLength={1000}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </label>
            <button className="primary">
              <Check size={16} /> 保存する
            </button>
          </form>
        ) : (
          <>
            <p className="summary">{node.summary}</p>
            <div className="section-label">
              OVERVIEW <span>仕組みと背景</span>
            </div>
            <p className="detail-text">{node.details}</p>
            {node.useCases.length > 0 && (
              <>
                <div className="section-label">
                  USE CASES <span>活用シーン</span>
                </div>
                <ul className="use-cases">
                  {node.useCases.map((s, i) => (
                    <li key={i}>
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {node.keywords.length > 0 && (
              <>
                <div className="section-label">KEYWORDS</div>
                <div className="keywords">
                  {node.keywords.map((k, i) => (
                    <span key={i}>{k}</span>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        <div className="section-label">
          CONNECTIONS <span>{connections.length} connections</span>
        </div>
        <div className="connections">
          {connections.length ? (
            connections.map((l) => (
              <button key={l.id} title={l.reason} onClick={() => select(l.targetNode.id)}>
                <span
                  className="dot"
                  style={{ background: colors[l.targetNode.category] ?? colors.Concept }}
                />
                <span className="connection-name">
                  {l.targetNode.term}
                  <small>{l.relationType}</small>
                </span>
                <span className="strength">
                  {Math.round(l.strength * 100)}
                  <small>%</small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))
          ) : (
            <p className="muted small">
              まだつながりはありません。関連するデモ用語を追加してみましょう。
            </p>
          )}
        </div>
        <div className="node-meta">
          {node.positionLocked ? '位置を固定済み' : '自動レイアウト'} ·{' '}
          {new Date(node.createdAt).toLocaleDateString('ja-JP')}
        </div>
      </div>
    </aside>
  );
}
