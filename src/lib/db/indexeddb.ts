const DB_NAME = "serein";
const DB_VERSION = 1;
const STORES = {
  drafts: "drafts", // key: scenarioId or "default" -> { text, updatedAt }
  messages: "messages", // key: conversationId -> { messages, updatedAt }
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("indexeddb_unavailable"));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.drafts)) {
        db.createObjectStore(STORES.drafts);
      }
      if (!db.objectStoreNames.contains(STORES.messages)) {
        db.createObjectStore(STORES.messages);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest
): Promise<T | undefined> {
  try {
    const db = await openDb();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const req = fn(store);
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined; // IndexedDB unavailable (private mode, SSR, unsupported) — fail silently
  }
}

export interface DraftRecord {
  text: string;
  updatedAt: string;
}

export async function saveDraft(key: string, text: string): Promise<void> {
  await withStore(STORES.drafts, "readwrite", (store) =>
    store.put({ text, updatedAt: new Date().toISOString() } satisfies DraftRecord, key)
  );
}

export async function getDraft(key: string): Promise<DraftRecord | undefined> {
  return withStore<DraftRecord>(STORES.drafts, "readonly", (store) => store.get(key));
}

export async function clearDraft(key: string): Promise<void> {
  await withStore(STORES.drafts, "readwrite", (store) => store.delete(key));
}

export interface CachedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface MessageCacheRecord {
  messages: CachedMessage[];
  updatedAt: string;
}

export async function cacheMessages(conversationKey: string, messages: CachedMessage[]): Promise<void> {
  await withStore(STORES.messages, "readwrite", (store) =>
    store.put({ messages, updatedAt: new Date().toISOString() } satisfies MessageCacheRecord, conversationKey)
  );
}

export async function getCachedMessages(conversationKey: string): Promise<CachedMessage[]> {
  const record = await withStore<MessageCacheRecord>(STORES.messages, "readonly", (store) =>
    store.get(conversationKey)
  );
  return record?.messages ?? [];
}
