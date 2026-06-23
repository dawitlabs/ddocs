import { openDB, type IDBPDatabase } from 'idb';
import type { DocIndex, InstalledDocSet, Bookmark, HistoryEntry } from '$lib/types.js';

const DB_NAME = 'ddocs';
const DB_VERSION = 1;

interface DocsDBSchema {
	indexes: { key: string; value: DocIndex };
	content: { key: string; value: string };
	meta: { key: string; value: InstalledDocSet };
	searchIndexes: { key: string; value: string };
	bookmarks: { key: string; value: Bookmark };
	history: { key: string; value: HistoryEntry };
}

let dbPromise: Promise<IDBPDatabase<DocsDBSchema>> | null = null;

function getDB() {
	if (!dbPromise) {
		dbPromise = openDB<DocsDBSchema>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains('indexes')) {
					db.createObjectStore('indexes');
				}
				if (!db.objectStoreNames.contains('content')) {
					db.createObjectStore('content');
				}
				if (!db.objectStoreNames.contains('meta')) {
					db.createObjectStore('meta');
				}
				if (!db.objectStoreNames.contains('searchIndexes')) {
					db.createObjectStore('searchIndexes');
				}
				if (!db.objectStoreNames.contains('bookmarks')) {
					db.createObjectStore('bookmarks');
				}
				if (!db.objectStoreNames.contains('history')) {
					db.createObjectStore('history');
				}
			},
		});
	}
	return dbPromise;
}

const CDN_BASE = 'https://documents.devdocs.io';

export async function installDocSet(
	slug: string,
	docName: string,
	version: string,
	onProgress?: (pct: number) => void,
): Promise<DocIndex> {
	onProgress?.(5);

	const indexRes = await fetch(`${CDN_BASE}/${slug}/index.json`);
	if (!indexRes.ok) throw new Error(`Failed to fetch index for ${slug}`);
	const index = (await indexRes.json()) as DocIndex;
	onProgress?.(15);

	const dbRes = await fetch(`${CDN_BASE}/${slug}/db.json`);
	if (!dbRes.ok) throw new Error(`Failed to fetch content for ${slug}`);
	const contentText = await dbRes.text();
	const sizeBytes = new Blob([contentText]).size;
	onProgress?.(70);

	const content = JSON.parse(contentText) as Record<string, string>;
	const db = await getDB();

	const tx = db.transaction(['indexes', 'content', 'meta'], 'readwrite');
	await tx.objectStore('indexes').put(index, slug);

	const contentStore = tx.objectStore('content');
	const entries = Object.entries(content);
	for (const [path, html] of entries) {
		await contentStore.put(html, `${slug}::${path}`);
	}

	const meta: InstalledDocSet = {
		slug,
		name: docName,
		version,
		installedAt: Date.now(),
		entryCount: index.entries.length,
		sizeBytes,
	};
	await tx.objectStore('meta').put(meta, slug);
	await tx.done;
	onProgress?.(90);

	onProgress?.(100);
	return index;
}

export async function uninstallDocSet(slug: string): Promise<void> {
	const db = await getDB();

	const index = await db.get('indexes', slug);
	const tx = db.transaction(['indexes', 'content', 'meta', 'searchIndexes'], 'readwrite');

	await tx.objectStore('indexes').delete(slug);
	await tx.objectStore('meta').delete(slug);
	await tx.objectStore('searchIndexes').delete(slug);

	if (index) {
		const contentStore = tx.objectStore('content');
		const allKeys = await contentStore.getAllKeys();
		for (const key of allKeys) {
			if (typeof key === 'string' && key.startsWith(`${slug}::`)) {
				await contentStore.delete(key);
			}
		}
	}

	await tx.done;
}

export async function getEntry(slug: string, path: string): Promise<string | undefined> {
	const db = await getDB();
	return db.get('content', `${slug}::${path}`);
}

export async function getIndex(slug: string): Promise<DocIndex | undefined> {
	const db = await getDB();
	return db.get('indexes', slug);
}

export async function getInstalledSets(): Promise<InstalledDocSet[]> {
	const db = await getDB();
	return db.getAll('meta');
}

export async function isInstalled(slug: string): Promise<boolean> {
	const db = await getDB();
	const meta = await db.get('meta', slug);
	return !!meta;
}

export async function saveSearchIndex(slug: string, serialized: string): Promise<void> {
	const db = await getDB();
	await db.put('searchIndexes', serialized, slug);
}

export async function getSearchIndex(slug: string): Promise<string | undefined> {
	const db = await getDB();
	return db.get('searchIndexes', slug);
}

export async function getAllSearchIndexSlugs(): Promise<string[]> {
	const db = await getDB();
	const keys = await db.getAllKeys('searchIndexes');
	return keys as string[];
}

export async function addBookmark(bookmark: Bookmark): Promise<void> {
	const db = await getDB();
	await db.put('bookmarks', bookmark, bookmark.id);
}

export async function removeBookmark(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('bookmarks', id);
}

export async function getBookmarks(): Promise<Bookmark[]> {
	const db = await getDB();
	return db.getAll('bookmarks');
}

export async function addHistory(entry: HistoryEntry): Promise<void> {
	const db = await getDB();
	await db.put('history', entry, entry.id);
}

export async function getHistory(): Promise<HistoryEntry[]> {
	const db = await getDB();
	const all = await db.getAll('history');
	return all.sort((a, b) => b.viewedAt - a.viewedAt);
}

export async function clearHistory(): Promise<void> {
	const db = await getDB();
	await db.clear('history');
}

export async function fetchIndexFromCDN(slug: string): Promise<DocIndex> {
	const res = await fetch(`${CDN_BASE}/${slug}/index.json`);
	if (!res.ok) throw new Error(`Failed to fetch index for ${slug}`);
	return res.json() as Promise<DocIndex>;
}

export async function getStorageEstimate(): Promise<{ used: number; quota: number }> {
	if (navigator.storage?.estimate) {
		const est = await navigator.storage.estimate();
		return { used: est.usage ?? 0, quota: est.quota ?? 0 };
	}
	return { used: 0, quota: 0 };
}
