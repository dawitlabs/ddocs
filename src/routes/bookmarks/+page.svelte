<script lang="ts">
	import { library } from '$lib/stores/library.svelte.js';
</script>

<svelte:head>
	<title>Saved - ddocs</title>
</svelte:head>

<div class="bookmarks-page">
	<h1 class="page-title">Saved</h1>

	{#if library.bookmarks.length > 0}
		<section class="section">
			<h2 class="section-title">Bookmarks</h2>
			<ul class="list">
				{#each library.bookmarks as bookmark}
					<li>
						<a href="/docs/{bookmark.slug}/{bookmark.path}" class="list-item">
							<span class="item-badge">{bookmark.docName}</span>
							<span class="item-name">{bookmark.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if library.history.length > 0}
		<section class="section">
			<h2 class="section-title">Recent</h2>
			<ul class="list">
				{#each library.history.slice(0, 30) as entry}
					<li>
						<a href="/docs/{entry.slug}/{entry.path}" class="list-item">
							<span class="item-badge">{entry.docName}</span>
							<span class="item-name">{entry.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if library.bookmarks.length === 0 && library.history.length === 0}
		<div class="empty">
			<p>No bookmarks or history yet.</p>
			<p>Browse documentation and bookmark entries for quick access.</p>
		</div>
	{/if}
</div>

<style>
	.bookmarks-page {
		max-width: 600px;
		margin: 0 auto;
		padding: 40px 24px;
	}

	.page-title {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 32px;
	}

	.section {
		margin-bottom: 32px;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-dim);
		margin: 0 0 12px;
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.list-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		text-decoration: none;
		border-bottom: 1px solid var(--color-border);
		transition: opacity 0.08s;
	}

	.list-item:hover {
		opacity: 0.8;
	}

	.item-badge {
		flex-shrink: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 6px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-dim);
	}

	.item-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty {
		text-align: center;
		padding: 48px 16px;
		color: var(--color-text-dim);
		font-size: 0.9375rem;
	}

	.empty p {
		margin: 0 0 4px;
	}
</style>
