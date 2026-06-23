<script lang="ts">
	import { page } from '$app/stores';
	import { catalog } from '$lib/stores/catalog.svelte.js';
	import { installed } from '$lib/stores/installed.svelte.js';
	import { getIndex, fetchIndexFromCDN } from '$lib/db/client.js';
	import InstallButton from '$lib/components/InstallButton.svelte';
	import type { DocIndex, DocSetMeta, DocType } from '$lib/types.js';

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

	let expandedSlug = $state('');
	let loadingSlug = $state('');
	let indexCache = $state<Record<string, DocIndex>>({});
	let expandedTypes = $state<Set<string>>(new Set());

	let autoExpandDone = false;
	$effect(() => {
		if (group && group.versions.length === 1 && !autoExpandDone) {
			autoExpandDone = true;
			expandAndFetch(group.versions[0].slug);
		}
	});

	function toggleExpand(slug: string) {
		if (expandedSlug === slug) {
			expandedSlug = '';
			return;
		}
		expandAndFetch(slug);
	}

	function expandAndFetch(slug: string) {
		expandedSlug = slug;
		expandedTypes = new Set();
		if (indexCache[slug]) return;
		loadingSlug = slug;
		const isInst = installed.isInstalled(slug);
		const fetchPromise = isInst ? getIndex(slug) : fetchIndexFromCDN(slug);
		fetchPromise
			.then((idx) => {
				if (idx) {
					indexCache = { ...indexCache, [slug]: idx };
					if (idx.types.length <= 8) {
						expandedTypes = new Set(idx.types.map((t) => t.slug));
					}
				}
			})
			.catch(() => {})
			.finally(() => {
				loadingSlug = '';
			});
	}

	function toggleType(typeSlug: string) {
		const next = new Set(expandedTypes);
		if (next.has(typeSlug)) next.delete(typeSlug);
		else next.add(typeSlug);
		expandedTypes = next;
	}

	function entriesForType(index: DocIndex, t: DocType) {
		return index.entries.filter((e) => e.type === t.name);
	}
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
				{#if group.versions.length > 1}
					<span class="count">{group.versions.length} versions</span>
				{/if}
				{#if installedCount > 0}
					<span class="installed-count">{installedCount} installed</span>
				{/if}
			</div>
		</header>

		<div class="version-list">
			{#each group.versions as doc (doc.slug)}
				<div
					class="version-card"
					class:is-installed={installed.isInstalled(doc.slug)}
					class:is-expanded={expandedSlug === doc.slug}
				>
					<div class="version-row">
						<button class="version-toggle" onclick={() => toggleExpand(doc.slug)}>
							<svg
								width="14" height="14" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2"
								class="chevron" class:expanded={expandedSlug === doc.slug}
							>
								<polyline points="9 18 15 12 9 6" />
							</svg>
							<span class="version-name">
								{doc.name}
								{#if doc.version}
									<span class="version-number">{doc.version}</span>
								{/if}
							</span>
							{#if indexCache[doc.slug]}
								<span class="entry-count">{indexCache[doc.slug].entries.length} entries</span>
							{/if}
							{#if installed.isInstalled(doc.slug)}
								<span class="status-badge">Installed</span>
							{/if}
						</button>
						<InstallButton slug={doc.slug} name={doc.name} version={doc.version} />
					</div>

					<div class="version-index">
						{#if loadingSlug === doc.slug}
							<div class="loading">Fetching index...</div>
						{:else if indexCache[doc.slug]}
							{#if indexCache[doc.slug].types.length === 0}
								<ul class="entry-list">
									{#each indexCache[doc.slug].entries.slice(0, 100) as entry}
										<li>
											{#if installed.isInstalled(doc.slug)}
												<a href="/docs/{doc.slug}/{entry.path}" class="entry-link">{entry.name}</a>
											{:else}
												<span class="entry-link dim">{entry.name}</span>
											{/if}
										</li>
									{/each}
									{#if indexCache[doc.slug].entries.length > 100}
										<li class="more">+ {indexCache[doc.slug].entries.length - 100} more entries</li>
									{/if}
								</ul>
							{:else}
								{#each indexCache[doc.slug].types as type}
									<div class="type-group">
										<button class="type-header" onclick={() => toggleType(type.slug)}>
											<svg
												width="12" height="12" viewBox="0 0 24 24"
												fill="none" stroke="currentColor" stroke-width="2"
												class="chevron-sm" class:expanded={expandedTypes.has(type.slug)}
											>
												<polyline points="9 18 15 12 9 6" />
											</svg>
											<span class="type-name">{type.name}</span>
											<span class="type-count">{type.count}</span>
										</button>
										{#if expandedTypes.has(type.slug)}
											<ul class="entry-list">
												{#each entriesForType(indexCache[doc.slug], type) as entry}
													<li>
														{#if installed.isInstalled(doc.slug)}
															<a href="/docs/{doc.slug}/{entry.path}" class="entry-link">{entry.name}</a>
														{:else}
															<span class="entry-link dim">{entry.name}</span>
														{/if}
													</li>
												{/each}
											</ul>
										{/if}
									</div>
								{/each}
							{/if}
							{#if !installed.isInstalled(doc.slug)}
								<p class="install-hint">Install to browse these docs offline</p>
							{/if}
						{:else if expandedSlug === doc.slug}
							<div class="loading">Failed to load index</div>
						{/if}
					</div>
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
		gap: 6px;
	}

	.version-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		overflow: hidden;
		transition: border-color 0.12s;
	}

	.version-card:hover {
		border-color: var(--color-text-dim);
	}

	.version-card.is-installed {
		border-color: var(--color-text-dim);
	}

	.version-card.is-expanded {
		border-color: var(--color-text-muted);
	}

	.version-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 16px;
	}

	.version-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text);
		font-size: 0.9375rem;
		text-align: left;
		padding: 0;
	}

	.version-name {
		font-weight: 600;
	}

	.version-number {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 400;
		color: var(--color-text-muted);
		margin-left: 4px;
	}

	.entry-count {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		font-weight: 400;
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

	.chevron {
		transition: transform 0.15s;
		flex-shrink: 0;
		color: var(--color-text-dim);
	}

	.chevron.expanded {
		transform: rotate(90deg);
	}

	.version-index {
		display: none;
		padding: 0 16px 16px 38px;
	}

	.version-card.is-expanded .version-index {
		display: block;
	}

	.loading {
		padding: 12px 0;
		color: var(--color-text-dim);
		font-size: 0.8125rem;
	}

	.type-group {
		border-bottom: 1px solid var(--color-border);
	}

	.type-group:last-child {
		border-bottom: none;
	}

	.type-header {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		padding: 8px 0;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text);
		font-size: 0.8125rem;
		font-weight: 600;
		text-align: left;
	}

	.type-header:hover {
		color: var(--color-text);
	}

	.chevron-sm {
		transition: transform 0.15s;
		flex-shrink: 0;
		color: var(--color-text-dim);
	}

	.chevron-sm.expanded {
		transform: rotate(90deg);
	}

	.type-name {
		flex: 1;
	}

	.type-count {
		font-size: 0.6875rem;
		color: var(--color-text-dim);
		font-weight: 400;
	}

	.entry-list {
		list-style: none;
		margin: 0 0 4px;
		padding: 0 0 0 18px;
	}

	.entry-link {
		display: block;
		padding: 3px 0;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color 0.08s;
	}

	a.entry-link:hover {
		color: var(--color-text);
	}

	.entry-link.dim {
		color: var(--color-text-dim);
	}

	.more {
		padding: 6px 0;
		font-size: 0.75rem;
		color: var(--color-text-dim);
		font-style: italic;
	}

	.install-hint {
		margin: 12px 0 0;
		padding: 8px 12px;
		font-size: 0.75rem;
		color: var(--color-text-dim);
		background: var(--color-bg);
		border-radius: 6px;
		text-align: center;
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

		.version-index {
			padding-left: 16px;
		}
	}
</style>
