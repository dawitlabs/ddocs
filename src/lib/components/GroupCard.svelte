<script lang="ts">
	import type { DocGroup } from '$lib/types.js';
	import { installed } from '$lib/stores/installed.svelte.js';

	let { group }: { group: DocGroup } = $props();

	const categoryLabels: Record<string, string> = {
		language: 'Language',
		framework: 'Framework',
		library: 'Library',
		tool: 'Tool',
		database: 'Database',
		platform: 'Platform',
		other: 'Other',
	};

	const installedCount = $derived(
		group.versions.filter((v) => installed.isInstalled(v.slug)).length,
	);
</script>

<a href="/browse/{group.baseSlug}" class="card">
	<div class="card-header">
		<h3 class="card-name">{group.name}</h3>
		<div class="card-counts">
			{#if installedCount > 0}
				<span class="installed-count">{installedCount} installed</span>
			{/if}
			{#if group.versions.length > 1}
				<span class="version-count">{group.versions.length}</span>
			{/if}
		</div>
	</div>
	<div class="card-meta">
		<span class="category-badge">{categoryLabels[group.category] ?? 'Other'}</span>
		{#if group.latestVersion}
			<span class="version">{group.latestVersion}</span>
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

	.card-counts {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.installed-count {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 7px;
		background: var(--color-text);
		color: var(--color-bg);
		border-radius: 4px;
	}

	.version-count {
		font-size: 0.6875rem;
		font-weight: 600;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 50%;
		color: var(--color-text-dim);
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
