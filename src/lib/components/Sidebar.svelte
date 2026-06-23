<script lang="ts">
	import { page } from '$app/stores';
	import { installed } from '$lib/stores/installed.svelte.js';
	import { searchState } from '$lib/stores/search.svelte.js';

	const pathname = $derived($page.url.pathname);

	const installedList = $derived(
		Array.from(installed.sets.values()).sort((a, b) => a.name.localeCompare(b.name)),
	);
</script>

<nav class="sidebar" aria-label="Main navigation">
	<a href="/" class="wordmark">ddocs</a>

	<button class="search-trigger" onclick={() => searchState.toggle()}>
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</svg>
		<span class="search-text">Search docs...</span>
		<kbd>⌘K</kbd>
	</button>

	{#if installedList.length > 0}
		<div class="section-label">Installed</div>
		<ul class="doc-list">
			{#each installedList as doc}
				<li>
					<a
						href="/docs/{doc.slug}"
						class="doc-link"
						class:active={pathname.startsWith(`/docs/${doc.slug}`)}
					>
						{doc.name}
					</a>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="sidebar-footer">
		<a
			href="/settings"
			class="footer-link"
			class:active={pathname === '/settings'}
		>
			Settings
		</a>
	</div>
</nav>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		position: fixed;
		inset: 0 auto 0 0;
		width: 240px;
		background: var(--color-surface);
		border-right: 1px solid var(--color-border);
		z-index: 30;
		padding: 24px 0 16px;
		overflow-y: auto;
	}

	.wordmark {
		display: block;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 900;
		letter-spacing: -0.05em;
		color: var(--color-text);
		text-decoration: none;
		padding: 0 20px 24px;
		line-height: 1;
	}

	.search-trigger {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 12px 20px;
		padding: 8px 12px;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: var(--color-text-dim);
		font-size: 0.8125rem;
		cursor: pointer;
		transition: border-color 0.12s;
	}

	.search-trigger:hover {
		border-color: var(--color-text-dim);
	}

	.search-text {
		flex: 1;
		text-align: left;
	}

	kbd {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		padding: 2px 5px;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-dim);
	}

	.section-label {
		padding: 0 20px;
		margin-bottom: 4px;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-dim);
	}

	.doc-list {
		list-style: none;
		margin: 0 0 16px;
		padding: 0;
	}

	.doc-link {
		display: block;
		padding: 6px 20px;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-muted);
		text-decoration: none;
		border-left: 2px solid transparent;
		transition: color 0.12s, border-color 0.12s;
	}

	.doc-link:hover {
		color: var(--color-text);
	}

	.doc-link.active {
		color: var(--color-text);
		border-left-color: var(--color-text);
	}

	.sidebar-footer {
		margin-top: auto;
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
	}

	.footer-link {
		display: block;
		padding: 6px 20px;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-dim);
		text-decoration: none;
		transition: color 0.12s;
	}

	.footer-link:hover,
	.footer-link.active {
		color: var(--color-text);
	}
</style>
