<script lang="ts">
	import { page } from '$app/stores';
	import { catalog } from '$lib/stores/catalog.svelte.js';
	import { installed } from '$lib/stores/installed.svelte.js';
	import InstallButton from '$lib/components/InstallButton.svelte';

	const baseSlug = $derived($page.params.group ?? '');
	const group = $derived(catalog.getGroup(baseSlug));

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
		group ? group.versions.filter((v) => installed.isInstalled(v.slug)).length : 0,
	);
</script>

<svelte:head>
	<title>{group?.name ?? baseSlug} - ddocs</title>
</svelte:head>

<div class="browse-page">
	{#if group}
		<header class="header">
			<div class="breadcrumb">
				<a href="/">ddocs</a>
				<span class="sep">/</span>
				<span>{group.name}</span>
			</div>
			<h1 class="title">{group.name}</h1>
			<div class="meta">
				<span class="category-badge">{categoryLabels[group.category] ?? 'Other'}</span>
				<span class="count">{group.versions.length} version{group.versions.length !== 1 ? 's' : ''}</span>
				{#if installedCount > 0}
					<span class="installed-count">{installedCount} installed</span>
				{/if}
			</div>
		</header>

		<div class="version-list">
			{#each group.versions as doc (doc.slug)}
				{@const isInstalled = installed.isInstalled(doc.slug)}
				<div class="version-row" class:is-installed={isInstalled}>
					<a href="/docs/{doc.slug}" class="version-info">
						<span class="version-name">
							{doc.name}
							{#if doc.version}
								<span class="version-number">{doc.version}</span>
							{/if}
						</span>
						{#if isInstalled}
							<span class="status-badge">Installed</span>
						{/if}
					</a>
					<InstallButton slug={doc.slug} name={doc.name} version={doc.version} />
				</div>
			{/each}
		</div>
	{:else}
		<div class="not-found">
			<p>Documentation group not found.</p>
			<a href="/" class="back-link">Back to catalog</a>
		</div>
	{/if}
</div>

<style>
	.browse-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 40px 24px;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8125rem;
		color: var(--color-text-dim);
		margin-bottom: 16px;
	}

	.breadcrumb a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--color-text);
	}

	.sep {
		color: var(--color-border);
	}

	.title {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		margin: 0 0 12px;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 10px;
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

	.count {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.installed-count {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 7px;
		background: var(--color-text);
		color: var(--color-bg);
		border-radius: 4px;
	}

	.header {
		margin-bottom: 32px;
	}

	.version-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.version-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 16px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		transition: border-color 0.12s;
	}

	.version-row:hover {
		border-color: var(--color-text-dim);
	}

	.version-row.is-installed {
		border-color: var(--color-text-dim);
	}

	.version-info {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
		min-width: 0;
		text-decoration: none;
		color: var(--color-text);
	}

	.version-name {
		font-weight: 600;
		font-size: 0.9375rem;
	}

	.version-number {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 400;
		color: var(--color-text-muted);
		margin-left: 4px;
	}

	.status-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 7px;
		background: var(--color-text);
		color: var(--color-bg);
		border-radius: 4px;
		flex-shrink: 0;
	}

	.not-found {
		text-align: center;
		padding: 64px 16px;
		color: var(--color-text-dim);
	}

	.back-link {
		color: var(--color-text-muted);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.back-link:hover {
		color: var(--color-text);
	}

	@media (max-width: 767px) {
		.browse-page {
			padding: 24px 16px;
		}

		.title {
			font-size: 1.75rem;
		}
	}
</style>
