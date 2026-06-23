import { search as engineSearch } from '$lib/search/engine.js';
import type { SearchResult } from '$lib/types.js';

class SearchState {
	query = $state('');
	results = $state<SearchResult[]>([]);
	open = $state(false);
	scopeSlug = $state('');

	private debounceTimer: ReturnType<typeof setTimeout> | null = null;

	toggle() {
		this.open = !this.open;
		if (!this.open) {
			this.query = '';
			this.results = [];
		}
	}

	setQuery(q: string) {
		this.query = q;

		if (this.debounceTimer) clearTimeout(this.debounceTimer);

		if (!q.trim()) {
			this.results = [];
			return;
		}

		this.debounceTimer = setTimeout(() => {
			this.results = engineSearch(this.query, {
				slug: this.scopeSlug || undefined,
				limit: 50,
			});
		}, 100);
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
