<script lang="ts">
	import { goto } from '$app/navigation';
	import { searchState } from '$lib/stores/search.svelte.js';
	import { search as engineSearch } from '$lib/search/engine.js';
	import { catalog } from '$lib/stores/catalog.svelte.js';
	import type { SearchResult } from '$lib/types.js';

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
	let query = $state('');
	let entryResults = $state<SearchResult[]>([]);
	let selectedIndex = $state(0);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const catalogMatches = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return catalog.docSets
			.filter((d) => d.name?.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q))
			.slice(0, 20);
	});

	const totalCount = $derived(entryResults.length + catalogMatches.length);

	$effect(() => {
		if (searchState.open) {
			dialogEl?.showModal();
			requestAnimationFrame(() => inputEl?.focus());
		} else {
			dialogEl?.close();
			query = '';
			entryResults = [];
			selectedIndex = 0;
		}
	});

	$effect(() => {
		if (!inputEl) return;
		const el = inputEl;
		const poll = setInterval(() => {
			if (el.value !== query) {
				query = el.value;
				selectedIndex = 0;
			}
		}, 100);
		return () => clearInterval(poll);
	});

	$effect(() => {
		const q = query.trim();
		if (debounceTimer) clearTimeout(debounceTimer);
		if (!q) {
			entryResults = [];
			return;
		}
		debounceTimer = setTimeout(() => {
			entryResults = engineSearch(query, { limit: 50 });
		}, 100);
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (totalCount) selectedIndex = (selectedIndex + 1) % totalCount;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (totalCount) selectedIndex = (selectedIndex - 1 + totalCount) % totalCount;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (selectedIndex < entryResults.length) {
				const r = entryResults[selectedIndex];
				goto(`/docs/${r.docSlug}/${r.entryPath}`);
			} else {
				const ci = selectedIndex - entryResults.length;
				if (ci < catalogMatches.length) {
					goto(`/docs/${catalogMatches[ci].slug}`);
				}
			}
			searchState.toggle();
		}
	}

	function navigateEntry(docSlug: string, entryPath: string) {
		goto(`/docs/${docSlug}/${entryPath}`);
		searchState.toggle();
	}

	function navigateDocSet(slug: string) {
		goto(`/docs/${slug}`);
		searchState.toggle();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="search-dialog"
	onclose={() => { if (searchState.open) searchState.toggle(); }}
	onclick={(e) => { if (e.target === dialogEl) searchState.toggle(); }}
>
	<div class="search-container">
		<div class="search-header">
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="search-icon"
			>
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.3-4.3" />
			</svg>
				<input
				bind:this={inputEl}
				bind:value={query}
				type="text"
				class="search-input"
				placeholder="Search documentation..."
				onkeydown={handleKeydown}
			/>
			<button class="search-close" onclick={() => searchState.toggle()}>
				<kbd>Esc</kbd>
			</button>
		</div>

		{#if totalCount > 0}
			<ul class="search-results">
				{#if entryResults.length > 0}
					{#if catalogMatches.length > 0}
						<li class="section-label">Entries</li>
					{/if}
					{#each entryResults as result, i}
						<li>
							<button
								class="result-item"
								class:selected={i === selectedIndex}
								onclick={() => navigateEntry(result.docSlug, result.entryPath)}
								onmouseenter={() => { selectedIndex = i; }}
							>
								<span class="result-badge">{result.docName}</span>
								<span class="result-name">{result.entryName}</span>
								{#if result.entryType}
									<span class="result-type">{result.entryType}</span>
								{/if}
							</button>
						</li>
					{/each}
				{/if}
				{#if catalogMatches.length > 0}
					{#if entryResults.length > 0}
						<li class="section-label">Documentation sets</li>
					{/if}
					{#each catalogMatches as doc, i}
						{@const idx = entryResults.length + i}
						<li>
							<button
								class="result-item"
								class:selected={idx === selectedIndex}
								onclick={() => navigateDocSet(doc.slug)}
								onmouseenter={() => { selectedIndex = idx; }}
							>
								<span class="result-badge">{doc.category}</span>
								<span class="result-name">{doc.name}</span>
								{#if doc.version}
									<span class="result-type">{doc.version}</span>
								{/if}
							</button>
						</li>
					{/each}
				{/if}
			</ul>
		{:else if query.trim()}
			<div class="no-results">No results found</div>
		{/if}
	</div>
</dialog>

<style>
	.search-dialog {
		position: fixed;
		inset: 0;
		width: 100%;
		max-width: 640px;
		height: fit-content;
		max-height: 70vh;
		margin: 15vh auto auto;
		padding: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		overflow: hidden;
		color: var(--color-text);
	}

	.search-dialog::backdrop {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
	}

	.search-container {
		display: flex;
		flex-direction: column;
		max-height: 70vh;
	}

	.search-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
		border-bottom: 1px solid var(--color-border);
	}

	.search-icon {
		flex-shrink: 0;
		color: var(--color-text-dim);
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		color: var(--color-text);
		font-size: 1rem;
		font-family: var(--font-body);
		outline: none;
	}

	.search-input::placeholder {
		color: var(--color-text-dim);
	}

	.search-close {
		flex-shrink: 0;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.search-close kbd {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		padding: 3px 6px;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-dim);
	}

	.search-results {
		list-style: none;
		margin: 0;
		padding: 8px;
		overflow-y: auto;
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 10px;
		background: none;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		text-align: left;
		color: var(--color-text);
		font-size: 0.875rem;
		transition: background 0.08s;
	}

	.result-item:hover,
	.result-item.selected {
		background: var(--color-surface-raised);
	}

	.result-badge {
		flex-shrink: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 6px;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-muted);
	}

	.result-name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 500;
	}

	.result-type {
		flex-shrink: 0;
		font-size: 0.75rem;
		color: var(--color-text-dim);
	}

	.section-label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-dim);
		padding: 10px 10px 4px;
	}

	.no-results {
		padding: 32px 16px;
		text-align: center;
		color: var(--color-text-dim);
		font-size: 0.875rem;
	}

	@media (max-width: 767px) {
		.search-dialog {
			max-width: 100%;
			margin: 0;
			border-radius: 0;
			max-height: 100vh;
			height: 100vh;
			border: none;
		}

		.search-container {
			max-height: 100vh;
		}
	}
</style>
