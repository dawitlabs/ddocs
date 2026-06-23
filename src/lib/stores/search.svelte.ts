import { search as engineSearch } from '$lib/search/engine.js';
import type { SearchResult } from '$lib/types.js';

class SearchState {
	query = $state('');
	results = $state<SearchResult[]>([]);
	open = $state(false);
	selectedIndex = $state(0);
	scopeSlug = $state('');

	private debounceTimer: ReturnType<typeof setTimeout> | null = null;

	toggle() {
		this.open = !this.open;
		if (!this.open) {
			this.query = '';
			this.results = [];
			this.selectedIndex = 0;
		}
	}

	setQuery(q: string) {
		this.query = q;
		this.selectedIndex = 0;

		if (this.debounceTimer) clearTimeout(this.debounceTimer);

		if (!q.trim()) {
			this.results = [];
			return;
		}

		this.debounceTimer = setTimeout(() => {
			this.results = engineSearch(q, {
				slug: this.scopeSlug || undefined,
				limit: 50,
			});
		}, 100);
	}

	moveSelection(delta: number) {
		const len = this.results.length;
		if (!len) return;
		this.selectedIndex = (this.selectedIndex + delta + len) % len;
	}

	getSelected(): SearchResult | undefined {
		return this.results[this.selectedIndex];
	}

	setScope(slug: string) {
		this.scopeSlug = slug;
		if (this.query) {
			this.results = engineSearch(this.query, {
				slug: slug || undefined,
				limit: 50,
			});
		}
	}
}

export const searchState = new SearchState();
