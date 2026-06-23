<script lang="ts">
	import { page } from '$app/stores';
	import { searchState } from '$lib/stores/search.svelte.js';

	const pathname = $derived($page.url.pathname);

	function isActive(href: string): boolean {
		return href === '/' ? pathname === '/' : pathname.startsWith(href);
	}

	const items = [
		{
			href: '/',
			label: 'Home',
			icon: `<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>`,
		},
		{
			href: '#search',
			label: 'Search',
			icon: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
		},
		{
			href: '/bookmarks',
			label: 'Saved',
			icon: `<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>`,
		},
		{
			href: '/settings',
			label: 'Settings',
			icon: `<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="8" cy="18" r="2" fill="currentColor" stroke="none"/>`,
		},
	];
</script>

<nav class="bottom-nav" aria-label="Main navigation">
	{#each items as item}
		{#if item.href === '#search'}
			<button
				class="bottom-item"
				class:active={searchState.open}
				onclick={() => searchState.toggle()}
			>
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					{@html item.icon}
				</svg>
				<span class="bottom-label">{item.label}</span>
			</button>
		{:else}
			<a
				href={item.href}
				class="bottom-item"
				class:active={isActive(item.href)}
			>
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					{@html item.icon}
				</svg>
				<span class="bottom-label">{item.label}</span>
			</a>
		{/if}
	{/each}
</nav>

<style>
	.bottom-nav {
		display: none;
	}

	@media (max-width: 767px) {
		.bottom-nav {
			display: flex;
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 30;
			height: calc(64px + env(safe-area-inset-bottom));
			padding-bottom: env(safe-area-inset-bottom);
			background: oklch(0.06 0 0 / 0.88);
			backdrop-filter: blur(16px);
			-webkit-backdrop-filter: blur(16px);
			border-top: 1px solid var(--color-border);
		}

		:global([data-theme='light']) .bottom-nav {
			background: oklch(0.99 0 0 / 0.88);
		}

		.bottom-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 4px;
			color: var(--color-text-muted);
			text-decoration: none;
			background: none;
			border: none;
			cursor: pointer;
			transition: color 0.12s;
		}

		.bottom-item.active {
			color: var(--color-text);
		}

		.bottom-item:active {
			opacity: 0.7;
		}

		.bottom-label {
			font-size: 10px;
			font-weight: 600;
			letter-spacing: 0.04em;
		}
	}
</style>
