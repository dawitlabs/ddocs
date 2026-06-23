<script lang="ts">
	import { goto } from '$app/navigation';
	import { searchState } from '$lib/stores/search.svelte.js';

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (searchState.open) {
			dialogEl?.showModal();
			requestAnimationFrame(() => inputEl?.focus());
		} else {
			dialogEl?.close();
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			searchState.moveSelection(1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			searchState.moveSelection(-1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const selected = searchState.getSelected();
			if (selected) {
				goto(`/docs/${selected.docSlug}/${selected.entryPath}`);
				searchState.toggle();
			}
		}
	}

	function navigate(docSlug: string, entryPath: string) {
		goto(`/docs/${docSlug}/${entryPath}`);
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
				type="text"
				class="search-input"
				placeholder="Search documentation..."
				value={searchState.query}
				oninput={(e) => searchState.setQuery(e.currentTarget.value)}
				onkeydown={handleKeydown}
			/>
			<button class="search-close" onclick={() => searchState.toggle()}>
				<kbd>Esc</kbd>
			</button>
		</div>

		{#if searchState.results.length > 0}
			<ul class="search-results">
				{#each searchState.results as result, i}
					<li>
						<button
							class="result-item"
							class:selected={i === searchState.selectedIndex}
							onclick={() => navigate(result.docSlug, result.entryPath)}
							onmouseenter={() => { searchState.selectedIndex = i; }}
						>
							<span class="result-badge">{result.docName}</span>
							<span class="result-name">{result.entryName}</span>
							{#if result.entryType}
								<span class="result-type">{result.entryType}</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{:else if searchState.query.trim()}
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
