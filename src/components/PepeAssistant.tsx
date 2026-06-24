import { useState, useCallback } from 'react';
import Fuse from 'fuse.js';
import { useAppStore } from '../store';
import { PEPE_KNOWLEDGE } from '../lib/pepeKnowledge';

const fuse = new Fuse(PEPE_KNOWLEDGE, {
  keys: ['keywords', 'topic'],
  threshold: 0.45,
  includeScore: true,
});

function PepeEyes({ expression }: { expression: 'neutral' | 'thinking' | 'happy' }) {
  if (expression === 'thinking') {
    return (
      <g>
        <path d="M 8 11 Q 14 8 20 11" fill="none" stroke="#388E3C" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 22 10 L 32 10" fill="none" stroke="#388E3C" strokeWidth="1.4" strokeLinecap="round" />
        <ellipse cx="13" cy="16" rx="6.5" ry="7" fill="#fff" stroke="#388E3C" strokeWidth="1" />
        <ellipse cx="27" cy="16" rx="6.5" ry="7" fill="#fff" stroke="#388E3C" strokeWidth="1" />
        <circle cx="11.5" cy="14.5" r="2.6" fill="#1a1a1a" />
        <circle cx="25" cy="14" r="2.6" fill="#1a1a1a" />
        <circle cx="12.5" cy="13.5" r="0.85" fill="#fff" />
        <circle cx="26" cy="13" r="0.85" fill="#fff" />
      </g>
    );
  }

  if (expression === 'happy') {
    return (
      <g>
        <ellipse cx="13" cy="16" rx="7" ry="7.5" fill="#fff" stroke="#388E3C" strokeWidth="1" />
        <ellipse cx="27" cy="16" rx="7" ry="7.5" fill="#fff" stroke="#388E3C" strokeWidth="1" />
        <circle cx="13" cy="17" r="3" fill="#1a1a1a" />
        <circle cx="27" cy="17" r="3" fill="#1a1a1a" />
        <circle cx="14.5" cy="15.5" r="1" fill="#fff" />
        <circle cx="28.5" cy="15.5" r="1" fill="#fff" />
      </g>
    );
  }

  return (
    <g>
      <ellipse cx="13" cy="17" rx="6.5" ry="7" fill="#fff" stroke="#388E3C" strokeWidth="1" />
      <ellipse cx="27" cy="17" rx="6.5" ry="7" fill="#fff" stroke="#388E3C" strokeWidth="1" />
      <path d="M 7 14 Q 13 12 19 14" fill="none" stroke="#388E3C" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 21 14 Q 27 12 33 14" fill="none" stroke="#388E3C" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="13" cy="18" r="2.4" fill="#1a1a1a" />
      <circle cx="27" cy="18" r="2.4" fill="#1a1a1a" />
      <circle cx="14" cy="17" r="0.75" fill="#fff" />
      <circle cx="28" cy="17" r="0.75" fill="#fff" />
    </g>
  );
}

function PepeMouth({ expression }: { expression: 'neutral' | 'thinking' | 'happy' }) {
  if (expression === 'happy') {
    return (
      <path
        d="M 10 28 Q 20 36 30 28 Q 20 32 10 28 Z"
        fill="#A1887F"
        stroke="#795548"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    );
  }

  if (expression === 'thinking') {
    return (
      <path
        d="M 12 29 L 28 29"
        fill="none"
        stroke="#795548"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }

  return (
    <path
      d="M 11 28 Q 16 30 20 28 Q 26 25 29 29"
      fill="none"
      stroke="#795548"
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
}

function PepeSvg({
  expression,
  size = 40,
}: {
  expression: 'neutral' | 'thinking' | 'happy';
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className="drop-shadow-md"
      aria-hidden
    >
      <ellipse cx="20" cy="22" rx="17" ry="15" fill="#4CAF50" stroke="#388E3C" strokeWidth="1.5" />
      <ellipse cx="20" cy="11" rx="11" ry="5.5" fill="#8BC34A" opacity="0.75" />
      <ellipse cx="20" cy="24" rx="7" ry="3.5" fill="#4CAF50" stroke="#388E3C" strokeWidth="1" />
      <circle cx="17.5" cy="24" r="1" fill="#388E3C" />
      <circle cx="22.5" cy="24" r="1" fill="#388E3C" />
      <PepeEyes expression={expression} />
      <ellipse cx="20" cy="27.5" rx="9" ry="3" fill="#A1887F" opacity="0.35" />
      <PepeMouth expression={expression} />
    </svg>
  );
}

/** Pepe assistant embedded at the bottom of the left tool panel. */
export function PepeEmbedded() {
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
    <div className="flex flex-col items-center">
      {open && (
        <div className="w-full mb-2 pointer-events-auto bg-zinc-950/95 border-2 border-green-600 rounded-xl p-3 shadow-lg max-h-64 overflow-y-auto sidebar-scroll">
          <h2 className="text-base font-bold text-green-300 mb-2">Pepe&apos;s Workshop</h2>
          <div className="flex gap-1 mb-2">
            {(['suggestions', 'ask'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPepeTab(t)}
                className={[
                  'text-base px-2 py-1 rounded-lg border-2 font-medium flex-1',
                  tab === t
                    ? 'border-green-500 bg-green-950/50 text-green-200'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600',
                ].join(' ')}
              >
                {t === 'suggestions' ? 'Tips' : 'Ask'}
              </button>
            ))}
          </div>

          {tab === 'suggestions' && (
            <ul className="space-y-1.5">
              {suggestions.length === 0 ? (
                <li className="text-base text-zinc-400">Looking good! No suggestions right now.</li>
              ) : (
                suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={[
                        'w-full text-left text-base p-2 rounded-lg border-2',
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
            <div className="space-y-2">
              <label className="flex flex-col gap-1 text-base text-zinc-300">
                Your question
                <input
                  type="text"
                  className="input-field text-base"
                  value={query}
                  onChange={(e) => search(e.target.value)}
                  placeholder="e.g. pocket holes?"
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
          'flex items-center justify-center rounded-xl border-2 border-green-600/80 w-10 h-10',
          'bg-zinc-900/95 hover:border-green-400 transition-all shadow-md',
          open ? 'border-green-400' : '',
        ].join(' ')}
        aria-label="Talk to Pepe"
        title="Pepe — design assistant"
      >
        <PepeSvg expression={open ? expression : 'neutral'} size={32} />
      </button>
      <span className="text-[10px] font-semibold text-zinc-500 mt-1">Pepe</span>
    </div>
  );
}
