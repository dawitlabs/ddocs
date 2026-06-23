<script lang="ts">
	import type { DocCategory } from '$lib/types.js';

	let { counts, active, onselect }: {
		counts: Record<string, number>;
		active: DocCategory | '';
		onselect: (cat: DocCategory | '') => void;
	} = $props();

	const categories: { key: DocCategory | ''; label: string }[] = [
		{ key: '', label: 'All' },
		{ key: 'language', label: 'Languages' },
		{ key: 'framework', label: 'Frameworks' },
		{ key: 'library', label: 'Libraries' },
		{ key: 'tool', label: 'Tools' },
		{ key: 'database', label: 'Databases' },
		{ key: 'platform', label: 'Platforms' },
		{ key: 'other', label: 'Other' },
	];

	function total(): number {
		return Object.values(counts).reduce((a, b) => a + b, 0);
	}
</script>

<div class="chips">
	{#each categories as cat}
		<button
			class="chip"
			class:active={active === cat.key}
			onclick={() => onselect(cat.key)}
		>
			{cat.label}
			<span class="chip-count">
				{cat.key === '' ? total() : (counts[cat.key] ?? 0)}
			</span>
		</button>
	{/each}
</div>

<style>
	.chips {
		display: flex;
		gap: 6px;
		overflow-x: auto;
		padding-bottom: 4px;
		scrollbar-width: none;
	}

	.chips::-webkit-scrollbar {
		display: none;
	}

	.chip {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 20px;
		color: var(--color-text-muted);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.12s;
	}

	.chip:hover {
		border-color: var(--color-text-dim);
		color: var(--color-text);
	}

	.chip.active {
		background: var(--color-text);
		border-color: var(--color-text);
		color: var(--color-bg);
	}

	.chip-count {
		font-size: 0.6875rem;
		opacity: 0.7;
	}
</style>
