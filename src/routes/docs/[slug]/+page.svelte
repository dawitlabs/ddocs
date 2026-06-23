<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { installed } from '$lib/stores/installed.svelte.js';
	import { catalog } from '$lib/stores/catalog.svelte.js';
	import { getIndex } from '$lib/db/client.js';
	import InstallButton from '$lib/components/InstallButton.svelte';
	import type { DocIndex, DocType } from '$lib/types.js';

	const slug = $derived($page.params.slug ?? '');
	const docMeta = $derived(catalog.docSets.find((d) => d.slug === slug));

	let index = $state<DocIndex | null>(null);
	let expandedTypes = $state<Set<string>>(new Set());

	$effect(() => {
		if (installed.isInstalled(slug)) {
			getIndex(slug).then((idx) => {
				if (idx) {
					index = idx;
					if (idx.types.length <= 8) {
						expandedTypes = new Set(idx.types.map((t) => t.slug));
					}
				}
			});
		} else {
			index = null;
		}
	});

	function toggleType(typeSlug: string) {
		const next = new Set(expandedTypes);
		if (next.has(typeSlug)) {
			next.delete(typeSlug);
		} else {
			next.add(typeSlug);
		}
		expandedTypes = next;
	}

	function entriesForType(t: DocType) {
		if (!index) return [];
		return index.entries.filter((e) => e.type === t.name);
	}
</script>

<svelte:head>
	<title>{docMeta?.name ?? slug} - ddocs</title>
</svelte:head>

<div class="doc-home">
	{#if docMeta}
		<header class="doc-header">
			<div class="breadcrumb">
				<a href="/">ddocs</a>
				<span class="sep">/</span>
				<span>{docMeta.name}</span>
			</div>
			<div class="doc-title-row">
				<h1 class="doc-title">{docMeta.name}</h1>
				<InstallButton slug={docMeta.slug} name={docMeta.name} version={docMeta.version} />
			</div>
			{#if docMeta.version}
				<p class="doc-version">v{docMeta.version}</p>
			{/if}
		</header>

		{#if !installed.isInstalled(slug)}
			<div class="install-prompt">
				<p>Install this documentation set to browse offline.</p>
			</div>
		{:else if index}
			<div class="toc">
				{#if index.types.length === 0}
					<ul class="entry-list">
						{#each index.entries as entry}
							<li>
								<a href="/docs/{slug}/{entry.path}" class="entry-link">
									{entry.name}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					{#each index.types as type}
						<div class="type-group">
							<button
								class="type-header"
								onclick={() => toggleType(type.slug)}
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									class="chevron"
									class:expanded={expandedTypes.has(type.slug)}
								>
									<polyline points="9 18 15 12 9 6" />
								</svg>
								<span class="type-name">{type.name}</span>
								<span class="type-count">{type.count}</span>
							</button>
							{#if expandedTypes.has(type.slug)}
								<ul class="entry-list">
									{#each entriesForType(type) as entry}
										<li>
											<a href="/docs/{slug}/{entry.path}" class="entry-link">
												{entry.name}
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		{:else if installed.isInstalling(slug)}
			<div class="loading">Installing... {installed.progress(slug)}%</div>
		{:else}
			<div class="loading">Loading...</div>
		{/if}
	{:else}
		<div class="loading">Documentation set not found.</div>
	{/if}
</div>

<style>
	.doc-home {
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

	.doc-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.doc-title {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0;
	}

	.doc-version {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-text-dim);
		margin: 6px 0 0;
	}

	.doc-header {
		margin-bottom: 32px;
	}

	.install-prompt {
		padding: 32px;
		text-align: center;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		color: var(--color-text-muted);
	}

	.install-prompt p {
		margin: 0;
	}

	.toc {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.type-group {
		border-bottom: 1px solid var(--color-border);
	}

	.type-header {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 10px 0;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text);
		font-size: 0.875rem;
		font-weight: 600;
		text-align: left;
	}

	.type-header:hover {
		color: var(--color-text);
	}

	.chevron {
		transition: transform 0.15s;
		flex-shrink: 0;
		color: var(--color-text-dim);
	}

	.chevron.expanded {
		transform: rotate(90deg);
	}

	.type-name {
		flex: 1;
	}

	.type-count {
		font-size: 0.75rem;
		color: var(--color-text-dim);
		font-weight: 400;
	}

	.entry-list {
		list-style: none;
		margin: 0 0 8px;
		padding: 0 0 0 22px;
	}

	.entry-link {
		display: block;
		padding: 4px 0;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color 0.08s;
	}

	.entry-link:hover {
		color: var(--color-text);
	}

	.loading {
		text-align: center;
		padding: 48px 16px;
		color: var(--color-text-dim);
	}

	@media (max-width: 767px) {
		.doc-home {
			padding: 24px 16px;
		}

		.doc-title {
			font-size: 1.5rem;
		}
	}
</style>
