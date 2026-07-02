import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import type { KnowledgeEntry } from '../lib/pepeKnowledge';
import { searchKnowledgeGated } from '../lib/pepeSearch';
import {
  type NotebookEntry,
  addNotebookEntry,
  getAllNotebookEntries,
  deleteNotebookEntry,
  downloadNotebookExport,
  importNotebookFile,
} from '../lib/pepeNotebookDb';

const NO_MATCH_MSG =
  "I don't have a reliable answer for that one. Try asking about woodworking, tools, or how something in DoveDesign works — or check the Tutorial tab.";

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

const NOTE_BLEND_STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'my', 'i', 'me', 'you', 'it',
  'this', 'that', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'and', 'or',
]);

function blendTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !NOTE_BLEND_STOPWORDS.has(t));
}

/**
 * Find notebook entries relevant to the current question: a note counts as
 * relevant if it shares at least one real (non-filler) word with the query
 * itself, or with the matched knowledge entry's topic/keywords — e.g. a note
 * about "my saw has a left-blade layout" surfaces when the matched answer is
 * about the table saw.
 */
function findRelevantNotes(
  notes: NotebookEntry[],
  queryTokens: string[],
  matchedEntry: KnowledgeEntry | null
): NotebookEntry[] {
  if (notes.length === 0) return [];
  const context = new Set(queryTokens);
  if (matchedEntry) {
    blendTokens(matchedEntry.topic).forEach((t) => context.add(t));
    matchedEntry.keywords.forEach((k) => blendTokens(k).forEach((t) => context.add(t)));
  }
  if (context.size === 0) return [];

  return notes
    .map((note) => {
      const noteTokens = new Set(blendTokens(note.text));
      let overlap = 0;
      noteTokens.forEach((t) => { if (context.has(t)) overlap++; });
      return { note, overlap };
    })
    .filter((r) => r.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 2)
    .map((r) => r.note);
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
  const [relevantNotes, setRelevantNotes] = useState<NotebookEntry[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef('');
  const knowledgeRef = useRef<KnowledgeEntry[]>([]);
  const knowledgeLoadedRef = useRef(false);
  const notebookRef = useRef<NotebookEntry[]>([]);

  // Notebook (IndexedDB) state — separate from the core knowledge search above.
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([]);
  const [teachOpen, setTeachOpen] = useState(false);
  const [teachText, setTeachText] = useState('');
  const [notebookStatus, setNotebookStatus] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const refreshNotebook = useCallback(async () => {
    const entries = await getAllNotebookEntries();
    notebookRef.current = entries;
    setNotebookEntries(entries);
  }, []);

  useEffect(() => {
    if (!open || knowledgeLoadedRef.current) return;
    knowledgeLoadedRef.current = true;
    import('../lib/pepeKnowledge').then(({ PEPE_KNOWLEDGE }) => {
      knowledgeRef.current = PEPE_KNOWLEDGE;
    });
    refreshNotebook();
  }, [open, refreshNotebook]);

  const runSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      lastQueryRef.current = trimmed;

      if (!trimmed) {
        setMatchedEntry(null);
        setNoMatch(false);
        setSuggestedTopics([]);
        setHelpful(null);
        setRelevantNotes([]);
        setPepeExpression('neutral');
        return;
      }

      // Phase 20: confidence-gated search. A below-threshold or out-of-scope
      // query (no meaningful overlap with the KB's own keyword/topic
      // vocabulary) returns confident: false — show the honest "no reliable
      // answer" fallback instead of forcing a best-effort match on garbage.
      const { results, confident } = searchKnowledgeGated(knowledgeRef.current, trimmed);
      const top = confident && results.length > 0 ? results[0].entry : null;

      const queryTokens = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 3 && !NOTE_BLEND_STOPWORDS.has(t));
      const notes = findRelevantNotes(notebookRef.current, queryTokens, top);
      setRelevantNotes(notes);

      if (top) {
        setMatchedEntry(top);
        setNoMatch(false);
        setSuggestedTopics([]);
        setHelpful(null);
        setPepeExpression('happy');
      } else if (notes.length > 0) {
        // No built-in knowledge-base match, but the user's own notebook has
        // something relevant — surface that instead of a flat "not sure."
        setMatchedEntry(null);
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

  const handleSaveNote = useCallback(async () => {
    const trimmed = teachText.trim();
    if (!trimmed) return;
    await addNotebookEntry(trimmed);
    setTeachText('');
    setTeachOpen(false);
    setNotebookStatus('Note saved.');
    await refreshNotebook();
    // Re-run the current search so a freshly taught note can show up right away.
    if (lastQueryRef.current) runSearch(lastQueryRef.current);
  }, [teachText, refreshNotebook, runSearch]);

  const handleDeleteNote = useCallback(
    async (id: string) => {
      await deleteNotebookEntry(id);
      await refreshNotebook();
    },
    [refreshNotebook]
  );

  const handleExportNotebook = useCallback(async () => {
    const entries = await getAllNotebookEntries();
    if (entries.length === 0) {
      setNotebookStatus('Nothing to export yet — add a note first.');
      return;
    }
    downloadNotebookExport(entries);
    setNotebookStatus(`Exported ${entries.length} note${entries.length === 1 ? '' : 's'}.`);
  }, []);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        const { added, skipped } = await importNotebookFile(file);
        setNotebookStatus(`Imported ${added} note${added === 1 ? '' : 's'}${skipped > 0 ? ` (${skipped} already saved)` : ''}.`);
        await refreshNotebook();
      } catch {
        setNotebookStatus('Could not read that file — make sure it is a Pepe notebook export.');
      }
    },
    [refreshNotebook]
  );

  const showResponse = matchedEntry !== null || noMatch || relevantNotes.length > 0;

  return (
    <div className="flex flex-col items-center">
      {open && (
        <div
          className="fixed bottom-16 left-16 z-50 w-[480px] max-w-[calc(100vw-120px)] rounded-xl border-2 border-green-600/80 bg-zinc-900/97 shadow-2xl p-4 max-h-[70vh] overflow-y-auto sidebar-scroll"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <h2 className="text-base font-bold text-green-300 mb-2">Pepe&apos;s Workshop</h2>
          <div className="flex gap-1 mb-2">
            {(['suggestions', 'ask', 'notebook'] as const).map((t) => (
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
                {t === 'suggestions' ? 'Tips' : t === 'ask' ? 'Ask' : 'Notebook'}
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
                <textarea
                  className="input-field text-base w-full resize-none"
                  rows={2}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Ask me anything about woodworking or DoveDesign..."
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
                      {relevantNotes.length > 0 && (
                        <div className="pt-1.5 border-t border-zinc-700/80 space-y-1">
                          <p className="text-xs font-bold text-amber-300">📓 From your notebook</p>
                          {relevantNotes.map((n) => (
                            <p key={n.id} className="text-sm text-zinc-300 leading-relaxed">{n.text}</p>
                          ))}
                        </div>
                      )}
                    </>
                  ) : relevantNotes.length > 0 ? (
                    <>
                      <p className="text-xs font-bold text-amber-300">📓 From your notebook</p>
                      <p className="text-sm text-zinc-400 italic">
                        Pepe doesn&apos;t have a built-in answer for that, but this note you saved looks relevant:
                      </p>
                      {relevantNotes.map((n) => (
                        <p key={n.id} className="text-sm text-zinc-300 leading-relaxed">{n.text}</p>
                      ))}
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

          {tab === 'notebook' && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">
                Your own notes — Pepe blends these into answers when they&apos;re relevant
                (e.g. your specific saw model or shop setup).
              </p>
              <p className="text-xs text-amber-300/90">
                Saved locally in this browser only — it is <span className="font-semibold">not</span> backed
                up anywhere. Use Export below to save a copy you can restore later or on another computer.
              </p>

              {!teachOpen ? (
                <button
                  type="button"
                  onClick={() => setTeachOpen(true)}
                  className="text-base px-2 py-1 rounded-lg border-2 border-green-700/80 bg-green-950/30 text-green-200 hover:border-green-500"
                >
                  + Add Custom Note
                </button>
              ) : (
                <div className="rounded-lg border-2 border-zinc-700 bg-zinc-900/80 p-2.5 space-y-2">
                  <textarea
                    className="input-field text-base w-full resize-none"
                    rows={2}
                    autoFocus
                    value={teachText}
                    onChange={(e) => setTeachText(e.target.value)}
                    placeholder='e.g. "My table saw has a left-tilt blade, 57° bevel stop"'
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      disabled={!teachText.trim()}
                      className="text-base px-2 py-1 rounded-lg border-2 border-green-600 bg-green-950/50 text-green-200 disabled:opacity-40"
                    >
                      Save Note
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTeachOpen(false); setTeachText(''); }}
                      className="text-base px-2 py-1 rounded-lg border-2 border-zinc-600 text-zinc-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportNotebook}
                  className="text-base px-2 py-1 rounded-lg border-2 border-zinc-600 text-zinc-300 hover:border-zinc-500"
                >
                  Export Notebook
                </button>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="text-base px-2 py-1 rounded-lg border-2 border-zinc-600 text-zinc-300 hover:border-zinc-500"
                >
                  Import Notebook
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </div>
              {notebookStatus && <p className="text-xs text-zinc-400">{notebookStatus}</p>}

              <ul className="space-y-1.5">
                {notebookEntries.length === 0 ? (
                  <li className="text-base text-zinc-400">
                    No notes yet — teach Pepe something about your shop or tools above.
                  </li>
                ) : (
                  notebookEntries.map((n) => (
                    <li
                      key={n.id}
                      className="flex items-start justify-between gap-2 text-sm p-2 rounded-lg border-2 border-zinc-700 bg-zinc-900/60 text-zinc-200"
                    >
                      <span>{n.text}</span>
                      <button
                        type="button"
                        aria-label="Delete note"
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-zinc-500 hover:text-red-400 shrink-0"
                      >
                        ✕
                      </button>
                    </li>
                  ))
                )}
              </ul>
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
