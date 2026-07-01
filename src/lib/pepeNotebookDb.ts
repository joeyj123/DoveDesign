/**
 * Pepe's personal Notebook — a local, per-browser store of the user's own notes
 * (e.g. "my saw has a left-blade layout, 57° bevel base"), backed by IndexedDB.
 *
 * DATA SAFETY: IndexedDB is per-browser and per-device — it is NOT backed up
 * anywhere and will be lost if the user clears browser data or switches
 * machines. exportNotebook()/importNotebook() below exist specifically to let
 * the user back this up as a JSON file, the same way .wcad project files work.
 */

export interface NotebookEntry {
  id: string;
  text: string;
  createdAt: number;
}

const DB_NAME = 'dovedesign-pepe-notebook';
const STORE_NAME = 'notes';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `note-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function addNotebookEntry(text: string): Promise<NotebookEntry> {
  const trimmed = text.trim();
  const entry: NotebookEntry = { id: newId(), text: trimmed, createdAt: Date.now() };
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(entry);
    tx.oncomplete = () => resolve(entry);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllNotebookEntries(): Promise<NotebookEntry[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const entries = (req.result as NotebookEntry[]).sort((a, b) => b.createdAt - a.createdAt);
      resolve(entries);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteNotebookEntry(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

interface NotebookExportFile {
  kind: 'dovedesign-pepe-notebook';
  exportedAt: string;
  entries: NotebookEntry[];
}

export function downloadNotebookExport(entries: NotebookEntry[]) {
  const payload: NotebookExportFile = {
    kind: 'dovedesign-pepe-notebook',
    exportedAt: new Date().toISOString(),
    entries,
  };
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pepe-notebook-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Merge entries from a previously exported JSON file into IndexedDB. Existing
 * notes are never overwritten or removed — this only adds notes whose text
 * doesn't already exist (case-insensitive, trimmed compare), so importing the
 * same backup twice is safe.
 */
export async function importNotebookFile(file: File): Promise<{ added: number; skipped: number }> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<NotebookExportFile>;
  const incoming = Array.isArray(parsed.entries) ? parsed.entries : [];
  if (incoming.length === 0) return { added: 0, skipped: 0 };

  const existing = await getAllNotebookEntries();
  const existingTexts = new Set(existing.map((e) => e.text.trim().toLowerCase()));

  const db = await openDb();
  let added = 0;
  let skipped = 0;

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    incoming.forEach((raw) => {
      const rawText = typeof raw?.text === 'string' ? raw.text.trim() : '';
      if (!rawText) return;
      const key = rawText.toLowerCase();
      if (existingTexts.has(key)) {
        skipped++;
        return;
      }
      existingTexts.add(key);
      added++;
      const entry: NotebookEntry = {
        id: typeof raw.id === 'string' ? raw.id : newId(),
        text: rawText,
        createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
      };
      store.put(entry);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return { added, skipped };
}
