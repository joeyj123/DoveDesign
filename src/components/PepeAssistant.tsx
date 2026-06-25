import { useState, useCallback, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { useAppStore } from '../store';
import type { KnowledgeEntry } from '../lib/pepeKnowledge';

const NO_MATCH_MSG =
  "Hmm, I'm not sure about that one -- try the Tutorial tab for more detail!";

function hasNumberedSteps(text: string): boolean {
  return /\b1\.\s/.test(text) || /\bStep\s+1\b/i.test(text);
}

function parseNumberedSteps(text: string): string[] {
  const parts = text.split(/(?:Step\s+\d+[:.]?\s*|\d+\.\s+)/i).filter((p) => p.trim());
  return parts.map((p) => p.trim()).filter(Boolean);
}

function pickRandomTopics(knowledge: KnowledgeEntry[], count: number): KnowledgeEntry[] {
  const pool = [...knowledge];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function AnswerBody({ answer }: { answer: string }) {
  if (!hasNumberedSteps(answer)) {
    return <p className="text-sm text-zinc-200 leading-relaxed">{answer}</p>;
  }
  const steps = parseNumberedSteps(answer);
  if (steps.length < 2) {
    return <p className="text-sm text-zinc-200 leading-relaxed">{answer}</p>;
  }
  return (
    <ol className="text-sm text-zinc-200 leading-relaxed list-decimal list-inside space-y-1.5">
      {steps.map((step, i) => (
        <li key={i}>{step}</li>
      ))}
    </ol>
  );
}

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
  const addPepeMissedQuery = useAppStore((s) => s.addPepeMissedQuery);
  const setSuggestionHighlightIds = useAppStore((s) => s.setSuggestionHighlightIds);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);

  const [query, setQuery] = useState('');
  const [matchedEntry, setMatchedEntry] = useState<KnowledgeEntry | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<KnowledgeEntry[]>([]);
  const [helpful, setHelpful] = useState<'up' | 'down' | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef('');
  const fuseRef = useRef<Fuse<KnowledgeEntry> | null>(null);
  const knowledgeRef = useRef<KnowledgeEntry[]>([]);
  const knowledgeLoadedRef = useRef(false);

  useEffect(() => {
    if (!open || knowledgeLoadedRef.current) return;
    knowledgeLoadedRef.current = true;
    import('../lib/pepeKnowledge').then(({ PEPE_KNOWLEDGE }) => {
      knowledgeRef.current = PEPE_KNOWLEDGE;
      fuseRef.current = new Fuse(PEPE_KNOWLEDGE, {
        keys: ['keywords', 'topic', 'answer'],
        threshold: 0.6,
        includeScore: true,
      });
    });
  }, [open]);

  const runSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      lastQueryRef.current = trimmed;

      if (!trimmed) {
        setMatchedEntry(null);
        setNoMatch(false);
        setSuggestedTopics([]);
        setHelpful(null);
        setPepeExpression('neutral');
        return;
      }

      const results = fuseRef.current?.search(trimmed) ?? [];
      if (results.length > 0 && (results[0].score ?? 1) < 0.65) {
        setMatchedEntry(results[0].item);
        setNoMatch(false);
        setSuggestedTopics([]);
        setHelpful(null);
        setPepeExpression('happy');
      } else {
        setMatchedEntry(null);
        setNoMatch(true);
        setSuggestedTopics(pickRandomTopics(knowledgeRef.current, 3));
        setHelpful(null);
        setPepeExpression('thinking');
      }
    },
    [setPepeExpression]
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setHelpful(null);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        runSearch('');
        return;
      }

      setPepeExpression('thinking');
      debounceRef.current = setTimeout(() => runSearch(value), 300);
    },
    [runSearch, setPepeExpression]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const showChipEntry = useCallback(
    (entry: KnowledgeEntry) => {
      setMatchedEntry(entry);
      setNoMatch(false);
      setSuggestedTopics([]);
      setHelpful(null);
      setPepeExpression('happy');
    },
    [setPepeExpression]
  );

  const handleThumbsDown = useCallback(() => {
    setHelpful('down');
    if (lastQueryRef.current) {
      addPepeMissedQuery(lastQueryRef.current);
    }
  }, [addPepeMissedQuery]);

  const showResponse = matchedEntry !== null || noMatch;

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
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Ask me anything about woodworking..."
                />
              </label>

              {showResponse && (
                <div className="rounded-lg border-2 border-zinc-700 bg-zinc-900/80 p-2.5 space-y-2">
                  {matchedEntry ? (
                    <>
                      <p className="text-xs font-bold text-green-300">{matchedEntry.topic}</p>
                      <AnswerBody answer={matchedEntry.answer} />
                      <div className="flex items-center gap-2 pt-1 border-t border-zinc-700/80">
                        <span className="text-xs text-zinc-400">Was this helpful?</span>
                        <button
                          type="button"
                          aria-label="Yes, helpful"
                          onClick={() => setHelpful('up')}
                          className={[
                            'text-base px-2 py-0.5 rounded border-2',
                            helpful === 'up'
                              ? 'border-green-500 bg-green-950/50 text-green-200'
                              : 'border-zinc-600 text-zinc-300 hover:border-zinc-500',
                          ].join(' ')}
                        >
                          👍
                        </button>
                        <button
                          type="button"
                          aria-label="No, not helpful"
                          onClick={handleThumbsDown}
                          className={[
                            'text-base px-2 py-0.5 rounded border-2',
                            helpful === 'down'
                              ? 'border-amber-600 bg-amber-950/40 text-amber-100'
                              : 'border-zinc-600 text-zinc-300 hover:border-zinc-500',
                          ].join(' ')}
                        >
                          👎
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-zinc-200 leading-relaxed">{NO_MATCH_MSG}</p>
                      {suggestedTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {suggestedTopics.map((entry) => (
                            <button
                              key={entry.id}
                              type="button"
                              onClick={() => showChipEntry(entry)}
                              className="text-sm px-2 py-1 rounded-full border-2 border-green-700/80 bg-green-950/30 text-green-200 hover:border-green-500"
                            >
                              {entry.topic}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
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
