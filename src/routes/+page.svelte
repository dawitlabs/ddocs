<script lang="ts">
	import { catalog } from '$lib/stores/catalog.svelte.js';
	import { installed } from '$lib/stores/installed.svelte.js';
	import CategoryChips from '$lib/components/CategoryChips.svelte';
	import DocCard from '$lib/components/DocCard.svelte';
	import type { DocCategory } from '$lib/types.js';

	let filterText = $state('');
	let activeCategory = $state<DocCategory | ''>('');


	const filtered = $derived.by(() => {
		let result = catalog.docSets;
		if (activeCategory) {
			result = result.filter((d) => d.category === activeCategory);
		}
		if (filterText) {
			const q = filterText.toLowerCase();
			result = result.filter(
				(d) => d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q),
			);
		}
		return result;
	});
</script>

<div class="home">
	<header class="hero">
		<h1 class="title">ddocs</h1>
		<p class="subtitle">
			{filtered.length} of {catalog.docSets.length} documentation sets, available offline
		</p>
	</header>

	<div class="controls">
		<input
			bind:value={filterText}
			type="text"
			class="filter-input"
			placeholder="Filter docs..."
		/>
		{#if installed.count > 0}
			<span class="installed-badge">{installed.count} installed</span>
		{/if}
	</div>

	<div class="chips-row">
		<CategoryChips
			counts={catalog.categoryCounts}
			active={activeCategory}
			onselect={(cat) => { activeCategory = cat; }}
		/>
	</div>

	<div class="grid">
		{#each filtered as docSet (docSet.slug)}
			<DocCard {docSet} />
		{/each}
	</div>

	{#if catalog.filtered.length === 0}
		<div class="empty">No documentation sets match your filter.</div>
	{/if}
</div>

<style>
	.home {
		max-width: 960px;
		margin: 0 auto;
		padding: 48px 24px;
	}

	.hero {
		margin-bottom: 40px;
	}

	.title {
		font-family: var(--font-display);
		font-size: 3rem;
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1;
		margin: 0 0 12px;
	}

	.subtitle {
		font-size: 1.0625rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.filter-input {
		flex: 1;
		max-width: 360px;
		padding: 9px 14px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: var(--color-text);
		font-size: 0.875rem;
		font-family: var(--font-body);
		outline: none;
		transition: border-color 0.12s;
	}

	.filter-input::placeholder {
		color: var(--color-text-dim);
	}

	.filter-input:focus {
		border-color: var(--color-text-muted);
	}

	.installed-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 4px 10px;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		color: var(--color-text-muted);
	}

	.chips-row {
		margin-bottom: 24px;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.empty {
		text-align: center;
		padding: 48px 16px;
		color: var(--color-text-dim);
		font-size: 0.9375rem;
	}

	@media (max-width: 767px) {
		.home {
			padding: 24px 16px;
		}

		.title {
			font-size: 2.25rem;
		}
	}
</style>
