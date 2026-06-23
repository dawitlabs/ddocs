<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import DocViewer from '$lib/components/DocViewer.svelte';
	import { getEntry } from '$lib/db/client.js';
	import { catalog } from '$lib/stores/catalog.svelte.js';
	import { library } from '$lib/stores/library.svelte.js';

	const slug = $derived($page.params.slug ?? '');
	const path = $derived($page.params.path ?? '');
	const docMeta = $derived(catalog.docSets.find((d) => d.slug === slug));

	let html = $state<string | null>(null);
	let notFound = $state(false);

	$effect(() => {
		if (!slug || !path) return;
		html = null;
		notFound = false;

		getEntry(slug, path).then((content) => {
			if (content) {
				html = content;
				if (docMeta) {
					library.recordView(slug, path, path.split('/').pop() ?? path, docMeta.name);
				}
			} else {
				notFound = true;
			}
		});
	});

	const isBookmarked = $derived(library.isBookmarked(slug, path));

	function toggleBookmark() {
		if (docMeta) {
			library.toggleBookmark(slug, path, path.split('/').pop() ?? path, docMeta.name);
		}
	}
</script>

<svelte:head>
	<title>{path} - {docMeta?.name ?? slug} - ddocs</title>
</svelte:head>

<div class="doc-entry">
	<header class="entry-header">
		<nav class="breadcrumb">
			<a href="/">ddocs</a>
			<span class="sep">/</span>
			<a href="/docs/{slug}">{docMeta?.name ?? slug}</a>
			<span class="sep">/</span>
			<span>{path}</span>
		</nav>
		<button class="bookmark-btn" class:active={isBookmarked} onclick={toggleBookmark} aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill={isBookmarked ? 'currentColor' : 'none'}
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
			</svg>
		</button>
	</header>

	{#if html}
		<DocViewer {html} {slug} />
	{:else if notFound}
		<div class="status-msg">
			<p>This entry is not available. Make sure the doc set is installed.</p>
			<a href="/docs/{slug}" class="back-link">Back to {docMeta?.name ?? slug}</a>
		</div>
	{:else}
		<div class="status-msg">Loading...</div>
	{/if}
</div>

<style>
	.doc-entry {
		max-width: 800px;
		margin: 0 auto;
		padding: 32px 24px 64px;
	}

	.entry-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8125rem;
		color: var(--color-text-dim);
		flex-wrap: wrap;
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

	.bookmark-btn {
		flex-shrink: 0;
		padding: 6px;
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-dim);
		cursor: pointer;
		transition: all 0.12s;
	}

	.bookmark-btn:hover {
		color: var(--color-text);
		border-color: var(--color-text-dim);
	}

	.bookmark-btn.active {
		color: var(--color-text);
		border-color: var(--color-text);
	}

	.status-msg {
		text-align: center;
		padding: 48px 16px;
		color: var(--color-text-dim);
	}

	.status-msg p {
		margin: 0 0 12px;
	}

	.back-link {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
		font-size: 0.875rem;
	}

	@media (max-width: 767px) {
		.doc-entry {
			padding: 20px 16px 64px;
		}
	}
</style>
