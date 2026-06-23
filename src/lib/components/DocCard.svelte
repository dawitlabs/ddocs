<script lang="ts">
	import type { DocSetMeta } from '$lib/types.js';
	import InstallButton from './InstallButton.svelte';

	let { docSet }: { docSet: DocSetMeta } = $props();

	const categoryLabels: Record<string, string> = {
		language: 'Language',
		framework: 'Framework',
		library: 'Library',
		tool: 'Tool',
		database: 'Database',
		platform: 'Platform',
		other: 'Other',
	};
</script>

<a href="/docs/{docSet.slug}" class="card">
	<div class="card-header">
		<h3 class="card-name">{docSet.name}</h3>
		<InstallButton slug={docSet.slug} name={docSet.name} version={docSet.version} />
	</div>
	<div class="card-meta">
		<span class="category-badge">{categoryLabels[docSet.category] ?? 'Other'}</span>
		{#if docSet.version}
			<span class="version">{docSet.version}</span>
		{/if}
	</div>
</a>

<style>
	.card {
		display: block;
		padding: 16px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		text-decoration: none;
		transition: border-color 0.12s, transform 0.12s;
	}

	.card:hover {
		border-color: var(--color-text-dim);
		transform: translateY(-1px);
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 10px;
	}

	.card-name {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
		line-height: 1.3;
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.category-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 7px;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-dim);
	}

	.version {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		font-family: var(--font-mono);
	}
</style>
