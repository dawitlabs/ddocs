import {
	addBookmark,
	removeBookmark,
	getBookmarks,
	addHistory,
	getHistory,
	clearHistory,
} from '$lib/db/client.js';
import type { Bookmark, HistoryEntry } from '$lib/types.js';

class LibraryState {
	bookmarks = $state<Bookmark[]>([]);
	history = $state<HistoryEntry[]>([]);

	async init() {
		this.bookmarks = await getBookmarks();
		this.history = await getHistory();
	}

	isBookmarked(slug: string, path: string): boolean {
		return this.bookmarks.some((b) => b.slug === slug && b.path === path);
	}

	async toggleBookmark(slug: string, path: string, name: string, docName: string) {
		const existing = this.bookmarks.find((b) => b.slug === slug && b.path === path);
		if (existing) {
			await removeBookmark(existing.id);
			this.bookmarks = this.bookmarks.filter((b) => b.id !== existing.id);
		} else {
			const bookmark: Bookmark = {
				id: `${slug}/${path}`,
				slug,
				path,
				name,
				docName,
				addedAt: Date.now(),
			};
			await addBookmark(bookmark);
			this.bookmarks = [...this.bookmarks, bookmark];
		}
	}

	async recordView(slug: string, path: string, name: string, docName: string) {
		const entry: HistoryEntry = {
			id: `${slug}/${path}`,
			slug,
			path,
			name,
			docName,
			viewedAt: Date.now(),
		};
		await addHistory(entry);

		const existing = this.history.findIndex((h) => h.id === entry.id);
		if (existing >= 0) {
			this.history = [entry, ...this.history.filter((_, i) => i !== existing)];
		} else {
			this.history = [entry, ...this.history].slice(0, 100);
		}
	}

	async clearAllHistory() {
		await clearHistory();
		this.history = [];
	}
}

export const library = new LibraryState();
