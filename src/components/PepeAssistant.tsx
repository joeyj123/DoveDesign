import { useState, useCallback } from 'react';
import Fuse from 'fuse.js';
import { useAppStore } from '../store';
import { PEPE_KNOWLEDGE } from '../lib/pepeKnowledge';

const fuse = new Fuse(PEPE_KNOWLEDGE, {
  keys: ['keywords', 'topic'],
  threshold: 0.45,
  includeScore: true,
});

function PepeSvg({ expression }: { expression: 'neutral' | 'thinking' | 'happy' }) {
  const mouth =
    expression === 'happy'
      ? 'M 14 20 Q 20 26 26 20'
      : expression === 'thinking'
        ? 'M 14 22 L 26 22'
        : 'M 14 21 Q 20 24 26 21';
  const eyeY = expression === 'happy' ? 14 : 15;
  return (
    <svg viewBox="0 0 40 40" className={`w-14 h-14 pepe-${expression}`} aria-hidden>
      <ellipse cx="20" cy="22" rx="16" ry="14" fill="#5a9e3e" stroke="#3d6b2a" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="5" ry="7" fill="#5a9e3e" stroke="#3d6b2a" strokeWidth="1" />
      <ellipse cx="28" cy="12" rx="5" ry="7" fill="#5a9e3e" stroke="#3d6b2a" strokeWidth="1" />
      <circle cx="15" cy={eyeY} r="2.5" fill="#1a1a1a" />
      <circle cx="25" cy={eyeY} r="2.5" fill="#1a1a1a" />
      <path d={mouth} fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
      {expression === 'thinking' && (
        <text x="32" y="8" fontSize="8" fill="#a1a1aa">...</text>
      )}
    </svg>
  );
}

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
    <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none">
      {open && (
        <div
          className="pointer-events-auto bg-zinc-950/95 border-2 border-green-600 rounded-2xl p-4 w-[min(360px,calc(100vw-2rem))] shadow-xl relative mb-2"
          style={{ marginRight: 8 }}
        >
          <div
            className="absolute -bottom-2 right-8 w-4 h-4 bg-zinc-950 border-r-2 border-b-2 border-green-600 rotate-45"
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
            <ul className="space-y-2 max-h-64 overflow-y-auto">
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
        className="pointer-events-auto rounded-full border-2 border-green-600 bg-zinc-950/90 p-1 hover:border-green-400 transition-colors"
        aria-label="Talk to Pepe"
        title="Pepe — design assistant"
      >
        <PepeSvg expression={open ? expression : 'neutral'} />
      </button>
    </div>
  );
}
