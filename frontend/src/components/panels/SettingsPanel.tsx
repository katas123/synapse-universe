import { useState, useRef, useEffect } from 'react';
import { X, CheckCircle2, Download, Upload, ChevronRight, Trash2 } from 'lucide-react';
import { useGraph } from '../../stores/graphStore';
import { parseGraph } from '../../types/graph';
export default function SettingsPanel({ close }: { close: () => void }) {
  const stored = useGraph((s) => s.stored),
    saving = useGraph((s) => s.saving);
  const graph = useGraph((s) => s.graph),
    busy = useGraph((s) => s.busy),
    replace = useGraph((s) => s.replace),
    reset = useGraph((s) => s.reset);
  const dialog = useRef<HTMLElement>(null);
  const file = useRef<HTMLInputElement>(null),
    [mode, setMode] = useState<'merge' | 'replace'>('merge'),
    [message, setMessage] = useState(''),
    [confirm, setConfirm] = useState(false),
    [working, setWorking] = useState(false);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    function trap(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = dialog.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled),input:not([hidden]):not(:disabled),[tabindex="0"]',
      );
      if (!elements?.length) return;
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    }
    const element = dialog.current;
    element?.addEventListener('keydown', trap);
    return () => {
      element?.removeEventListener('keydown', trap);
      before?.focus();
    };
  }, [close]);
  function exportGraph() {
    const blob = new Blob(
        [JSON.stringify({ ...graph, metadata: { exportedAt: new Date().toISOString() } }, null, 2)],
        { type: 'application/json' },
      ),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = `synapse-universe-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('JSONバックアップをダウンロードしました。');
  }
  async function importFile(f: File | undefined) {
    if (!f) return;
    setWorking(true);
    try {
      if (f.size > 5_000_000) throw new Error('size');
      const valid = parseGraph(JSON.parse(await f.text()));
      await replace(valid, mode === 'merge');
      setMessage(`${valid.nodes.length}件の知識を取り込みました。`);
    } catch {
      setMessage(
        '読み込めませんでした。Synapse Universe形式のJSONを確認してください。既存データは保持されています。',
      );
    } finally {
      if (file.current) file.current.value = '';
      setWorking(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        ref={dialog}
        tabIndex={-1}
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="宇宙の設定"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">YOUR UNIVERSE</span>
            <h2>宇宙の設定</h2>
          </div>
          <button className="icon-button" title="閉じる" onClick={close}>
            <X />
          </button>
        </div>
        <div className="status-card">
          <span className="status-orb" />
          <div>
            <strong>デモモード</strong>
            <p>内蔵辞書で解析体験 · Codex未接続</p>
          </div>
          <span className="demo-badge">DEMO</span>
        </div>
        <p className="settings-note">
          このURLでは外部AI APIを使用しません。収録用語の説明とキーワードから関連を生成します。
        </p>
        <div className="storage-stat">
          <div>
            <strong>{graph.nodes.length}</strong>
            <span>知識ノード</span>
          </div>
          <div>
            <strong>{graph.links.length}</strong>
            <span>つながり</span>
          </div>
          <div>
            <CheckCircle2 size={23} />
            <span>
              {saving ? '保存中' : stored ? 'このブラウザに保存' : '未保存・バックアップ推奨'}
            </span>
          </div>
        </div>
        <div className="section-label">BACKUP & RESTORE</div>
        <button className="settings-action" onClick={exportGraph}>
          <Download size={18} />
          <span>
            JSONを書き出す<small>あなたの宇宙をバックアップ</small>
          </span>
          <ChevronRight size={16} />
        </button>
        <div className="import-mode">
          <label>
            <input type="radio" checked={mode === 'merge'} onChange={() => setMode('merge')} />{' '}
            既存の知識に追加
          </label>
          <label>
            <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} />{' '}
            全体を置き換え
          </label>
        </div>
        <input
          type="file"
          ref={file}
          accept=".json,application/json"
          hidden
          onChange={(e) => void importFile(e.target.files?.[0])}
        />
        <button
          className="settings-action"
          disabled={busy || working}
          onClick={() => file.current?.click()}
        >
          <Upload size={18} />
          <span>
            JSONを読み込む<small>検証後に{mode === 'merge' ? '追加' : '置き換え'}します</small>
          </span>
          <ChevronRight size={16} />
        </button>
        {message && (
          <p className="settings-message" role="status">
            {message}
          </p>
        )}
        <div className="danger-area">
          {confirm ? (
            <div>
              <p>
                すべての知識を削除しますか？
                <br />
                必要なら先にJSONを書き出してください。
              </p>
              <button
                className="danger-button"
                disabled={busy || working}
                onClick={async () => {
                  setWorking(true);
                  try {
                    await reset();
                    setConfirm(false);
                    setMessage('知識グラフをリセットしました。');
                  } catch {
                    setMessage('リセットできませんでした。');
                  } finally {
                    setWorking(false);
                  }
                }}
              >
                削除する
              </button>
              <button className="text-button" onClick={() => setConfirm(false)}>
                キャンセル
              </button>
            </div>
          ) : (
            <button
              className="text-button"
              disabled={busy || working}
              onClick={() => setConfirm(true)}
            >
              <Trash2 size={14} /> 知識グラフをリセット
            </button>
          )}
        </div>
        <p className="privacy-note">
          保存先はこの端末・このブラウザです。別の端末への移行にはJSONを利用してください。
        </p>
      </section>
    </div>
  );
}
