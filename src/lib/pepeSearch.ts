import { Index } from 'flexsearch';
import type { KnowledgeEntry } from './pepeKnowledge';

/**
 * FlexSearch-backed concept matching for Pepe.
 *
 * IMPORTANT — be honest about what this is: this is better keyword/concept
 * overlap matching, not comprehension. It can only surface an existing
 * KnowledgeEntry whose topic/keywords/answer text overlaps with what the user
 * typed (after typo-correction and filler-word stripping) — it never invents
 * a new answer and never reasons across multiple entries. 100% client-side,
 * no network calls.
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'do', 'does', 'did',
  'how', 'what', 'which', 'why', 'when', 'where', 'who',
  'to', 'of', 'in', 'on', 'at', 'for', 'with', 'about', 'into', 'from',
  'my', 'i', 'me', 'you', 'it', 'this', 'that', 'these', 'those',
  'can', 'could', 'should', 'would', 'will',
  'please', 'pls', 'and', 'or', 'so', 'just', 'need', 'want', 'help', 'know',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Strip filler words, but never strip everything away — fall back to the raw tokens. */
function stripFillers(tokens: string[]): string[] {
  const kept = tokens.filter((t) => !STOPWORDS.has(t));
  return kept.length > 0 ? kept : tokens;
}

/** Classic iterative Levenshtein edit distance (two-row DP, O(m*n) time, O(n) space). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Snap any query token that isn't already in the knowledge-base vocabulary to
 * its nearest Levenshtein neighbor, when the neighbor is close enough to be a
 * confident correction (a typo, not a different word entirely).
 */
function correctTypos(tokens: string[], vocabulary: string[], vocabularySet: Set<string>): string[] {
  return tokens.map((token) => {
    if (token.length < 4 || vocabularySet.has(token)) return token;
    let best = token;
    let bestDist = Infinity;
    for (const word of vocabulary) {
      if (Math.abs(word.length - token.length) > 2) continue;
      const dist = levenshtein(token, word);
      if (dist < bestDist) {
        bestDist = dist;
        best = word;
        if (dist === 0) break;
      }
    }
    const maxAllowed = token.length <= 5 ? 1 : 2;
    return bestDist <= maxAllowed ? best : token;
  });
}

interface BuiltIndex {
  keywordIndex: Index;
  topicIndex: Index;
  answerIndex: Index;
  byId: Map<string, KnowledgeEntry>;
  vocabulary: string[];
  vocabularySet: Set<string>;
}

let cache: { entries: KnowledgeEntry[]; built: BuiltIndex } | null = null;

function buildIndex(entries: KnowledgeEntry[]): BuiltIndex {
  const keywordIndex = new Index({ tokenize: 'forward' });
  const topicIndex = new Index({ tokenize: 'forward' });
  const answerIndex = new Index({ tokenize: 'forward' });
  const byId = new Map<string, KnowledgeEntry>();
  const vocabularySet = new Set<string>();

  entries.forEach((entry) => {
    byId.set(entry.id, entry);
    keywordIndex.add(entry.id, entry.keywords.join(' '));
    topicIndex.add(entry.id, entry.topic);
    answerIndex.add(entry.id, entry.answer);
    entry.keywords.forEach((k) => tokenize(k).forEach((t) => { if (t.length >= 3) vocabularySet.add(t); }));
    tokenize(entry.topic).forEach((t) => { if (t.length >= 3) vocabularySet.add(t); });
  });

  return { keywordIndex, topicIndex, answerIndex, byId, vocabulary: [...vocabularySet], vocabularySet };
}

function getIndex(entries: KnowledgeEntry[]): BuiltIndex {
  if (cache && cache.entries === entries) return cache.built;
  const built = buildIndex(entries);
  cache = { entries, built };
  return built;
}

export interface PepeSearchResult {
  entry: KnowledgeEntry;
  score: number;
}

/**
 * Search the knowledge base with loose, conversational-input tolerance:
 * strips filler words, corrects likely typos against the KB's own vocabulary,
 * then ranks entries by weighted overlap across keywords (strongest signal),
 * topic (medium), and answer text (weakest, but still useful).
 */
export function searchKnowledge(
  entries: KnowledgeEntry[],
  rawQuery: string,
  limit = 6
): PepeSearchResult[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) return [];

  const { keywordIndex, topicIndex, answerIndex, byId, vocabulary, vocabularySet } = getIndex(entries);

  const rawTokens = tokenize(trimmed);
  if (rawTokens.length === 0) return [];
  const corrected = correctTypos(rawTokens, vocabulary, vocabularySet);
  // Drop stray 1-letter artifacts left over from stripping punctuation (e.g.
  // "what's" -> "what", "s") — they carry no search signal and only add noise.
  const cleanedTokens = stripFillers(corrected).filter((t) => t.length >= 2);
  if (cleanedTokens.length === 0) return [];

  const scoreById = new Map<string, number>();
  const applyResults = (ids: unknown[], weight: number) => {
    ids.forEach((id, rank) => {
      const key = String(id);
      const rankScore = (ids.length - rank) * weight;
      scoreById.set(key, (scoreById.get(key) ?? 0) + rankScore);
    });
  };

  // Search each meaningful word individually and sum weighted-by-rank scores
  // across words, so an entry that overlaps several of the user's words ranks
  // above one that only shares a single word. (FlexSearch's own multi-word
  // query requires ALL words to co-occur in a document, which is too strict
  // for loose conversational phrasing — a straight join would silently return
  // zero results the moment any one stray word wasn't present in a match.)
  cleanedTokens.forEach((token) => {
    applyResults(keywordIndex.search(token, { limit: 8 }) as unknown[], 3);
    applyResults(topicIndex.search(token, { limit: 8 }) as unknown[], 2);
    applyResults(answerIndex.search(token, { limit: 8 }) as unknown[], 1);
  });

  // Extra bonus, on top of the per-word scores above, for entries that also
  // match the full phrase closely (contiguous word order) — rewards a tight
  // phrase match without requiring one.
  if (cleanedTokens.length > 1) {
    const phrase = cleanedTokens.join(' ');
    applyResults(keywordIndex.search(phrase, { limit: 8, suggest: true }) as unknown[], 2);
    applyResults(topicIndex.search(phrase, { limit: 8, suggest: true }) as unknown[], 1);
  }

  return [...scoreById.entries()]
    .map(([id, score]) => ({ entry: byId.get(id), score }))
    .filter((r): r is PepeSearchResult => !!r.entry)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
