import { useState, useCallback } from 'react';
import Fuse from 'fuse.js';
import { useAppStore } from '../store';
import { PEPE_KNOWLEDGE } from '../lib/pepeKnowledge';

const fuse = new Fuse(PEPE_KNOWLEDGE, {
  keys: ['keywords', 'topic'],
  threshold: 0.45,
  includeScore: true,
});

function PepeSvg({
  expression,
  size = 48,
}: {
  expression: 'neutral' | 'thinking' | 'happy';
  size?: number;
}) {
  const blush =
    expression === 'happy' ? (
      <>
        <circle cx="14" cy="28" r="3" fill="#F48FB1" opacity="0.55" />
        <circle cx="34" cy="28" r="3" fill="#F48FB1" opacity="0.55" />
      </>
    ) : null;

  const eyes =
    expression === 'thinking' ? (
      <>
        <ellipse cx="17" cy="20" rx="5" ry="5.5" fill="#fff" />
        <ellipse cx="31" cy="18" rx="5" ry="5.5" fill="#fff" />
        <circle cx="18" cy="21" r="2.2" fill="#1a1a1a" />
        <circle cx="29" cy="19" r="2.2" fill="#1a1a1a" />
        <path d="M 12 14 Q 17 11 22 14" fill="none" stroke="#388E3C" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 26 13 L 34 13" fill="none" stroke="#388E3C" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ) : expression === 'happy' ? (
      <>
        <ellipse cx="17" cy="20" rx="6" ry="6.5" fill="#fff" />
        <ellipse cx="31" cy="20" rx="6" ry="6.5" fill="#fff" />
        <circle cx="17" cy="21" r="2.8" fill="#1a1a1a" />
        <circle cx="31" cy="21" r="2.8" fill="#1a1a1a" />
        <circle cx="18.5" cy="19" r="0.9" fill="#fff" />
        <circle cx="32.5" cy="19" r="0.9" fill="#fff" />
      </>
    ) : (
      <>
        <ellipse cx="17" cy="21" rx="5" ry="5.5" fill="#fff" />
        <ellipse cx="31" cy="21" rx="5" ry="5.5" fill="#fff" />
        <circle cx="17" cy="22" r="2.2" fill="#1a1a1a" />
        <circle cx="31" cy="22" r="2.2" fill="#1a1a1a" />
      </>
    );

  const mouth =
    expression === 'happy' ? (
      <path d="M 14 30 Q 24 38 34 30" fill="none" stroke="#388E3C" strokeWidth="2" strokeLinecap="round" />
    ) : expression === 'thinking' ? (
      <path d="M 16 32 L 28 32" fill="none" stroke="#388E3C" strokeWidth="1.8" strokeLinecap="round" />
    ) : (
      <path d="M 16 31 Q 24 35 32 31" fill="none" stroke="#388E3C" strokeWidth="1.8" strokeLinecap="round" />
    );

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className="drop-shadow-md"
      aria-hidden
    >
      <circle cx="24" cy="26" r="20" fill="#4CAF50" stroke="#388E3C" strokeWidth="2" />
      <ellipse cx="24" cy="30" rx="11" ry="9" fill="#A5D6A7" opacity="0.85" />
      {eyes}
      <circle cx="21" cy="27" r="1.1" fill="#388E3C" />
      <circle cx="27" cy="27" r="1.1" fill="#388E3C" />
      {mouth}
      {blush}
    </svg>
  );
}

/** Pepe lives in the sidebar — never over the viewport gizmo. */
export default function PepeAssistant() {
  const open = useAppStore((s) => s.ui.pepePanelOpen);
  const tab = useAppStore((s) => s.ui.pepeTab);
  const expression = useAppStore((s) => s.ui.pepeExpression);
  const suggestions = useAppStore((s) => s.ui.designSuggestions);
  const setPepePanelOpen = useAppStore((s) => s.setPepePanelOpen);
  const setPepeTab = useAppStore((s) => s.setPepeTab);
  const setPepeExpression = useAppStore((s) => s.setPepeExpression);
  const setSuggestionHighlightIds = useAppStore((s) => s.setSuggestionHighlightIds);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);

  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (!q.trim()) {
        setAnswer('');
        setPepeExpression('neutral');
        return;
      }
      setPepeExpression('thinking');
      const results = fuse.search(q.trim());
      if (results.length > 0 && (results[0].score ?? 1) < 0.5) {
        setAnswer(results[0].item.answer);
        setPepeExpression('happy');
      } else {
        setAnswer(
          "Hmm, I'm not sure about that one — try the Suggestions tab or the Tutorial for more detail!"
        );
        setPepeExpression('thinking');
      }
    },
    [setPepeExpression]
  );

  return (
    <div
      className="absolute z-50 flex flex-col items-end pointer-events-none"
      style={{
        bottom: 16,
        right: 16,
        maxWidth: 'calc(100% - 1rem)',
      }}
    >
      {open && (
        <div
          className="pointer-events-auto bg-zinc-950/95 border-2 border-green-600 rounded-2xl p-4 w-[min(320px,calc(100vw-28rem))] shadow-xl relative mb-3 mr-1"
        >
          <div
            className="absolute -bottom-2 right-6 w-4 h-4 bg-zinc-950 border-r-2 border-b-2 border-green-600 rotate-45"
            aria-hidden
          />
          <h2 className="text-base font-bold text-green-300 mb-3">Pepe&apos;s Workshop</h2>
          <div className="flex gap-2 mb-3">
            {(['suggestions', 'ask'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPepeTab(t)}
                className={[
                  'text-base px-3 py-2 rounded-lg border-2 font-medium',
                  tab === t
                    ? 'border-green-500 bg-green-950/50 text-green-200'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600',
                ].join(' ')}
              >
                {t === 'suggestions' ? 'Suggestions' : 'Ask Pepe'}
              </button>
            ))}
          </div>

          {tab === 'suggestions' && (
            <ul className="space-y-2 max-h-52 overflow-y-auto">
              {suggestions.length === 0 ? (
                <li className="text-base text-zinc-400">Looking good! No suggestions right now.</li>
              ) : (
                suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={[
                        'w-full text-left text-base p-3 rounded-lg border-2',
                        s.severity === 'warning'
                          ? 'border-amber-600/60 bg-amber-950/30 text-amber-100'
                          : s.severity === 'error'
                            ? 'border-red-600/60 bg-red-950/30 text-red-100'
                            : 'border-zinc-700 bg-zinc-900/60 text-zinc-200',
                      ].join(' ')}
                      onClick={() => {
                        if (s.relatedMemberIds?.length) {
                          setSuggestionHighlightIds(s.relatedMemberIds);
                        }
                      }}
                    >
                      <span className="font-semibold">{s.category}: </span>
                      {s.message}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}

          {tab === 'ask' && (
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-base text-zinc-300">
                Your question
                <input
                  type="text"
                  className="input-field text-base"
                  value={query}
                  onChange={(e) => search(e.target.value)}
                  placeholder="e.g. How do I use pocket holes?"
                />
              </label>
              {answer && (
                <p className="text-base text-zinc-200 leading-relaxed">{answer}</p>
              )}
              <button
                type="button"
                className="text-base text-green-400 underline"
                onClick={() => setRightPanelTab('tutorial')}
              >
                Open Tutorial tab
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setPepePanelOpen(!open)}
        className={[
          'pointer-events-auto rounded-full border-2 border-green-600 bg-zinc-900/95 p-1.5',
          'hover:border-green-400 transition-all shadow-lg',
          open ? 'scale-105' : 'scale-100',
        ].join(' ')}
        aria-label="Talk to Pepe"
        title="Pepe — design assistant"
      >
        <PepeSvg expression={open ? expression : 'neutral'} size={open ? 52 : 48} />
      </button>
    </div>
  );
}
