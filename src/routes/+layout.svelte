<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import SearchDialog from '$lib/components/SearchDialog.svelte';
	import { catalog } from '$lib/stores/catalog.svelte.js';
	import { installed } from '$lib/stores/installed.svelte.js';
	import { theme } from '$lib/stores/theme.svelte.js';
	import { library } from '$lib/stores/library.svelte.js';
	import { searchState } from '$lib/stores/search.svelte.js';
	import { initSearch } from '$lib/search/engine.js';
	import type { DocSetMeta } from '$lib/types.js';

	let { children, data }: { children: any; data: { catalog: DocSetMeta[] } } = $props();

	onMount(() => {
		catalog.init(data.catalog);
		theme.init();
		installed.init();
		library.init();
		initSearch();

		function handleKeydown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				searchState.toggle();
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<svelte:head>
	<title>ddocs</title>
	<meta name="description" content="Offline-first developer documentation" />
	<meta name="theme-color" content="#0a0a0a" />
</svelte:head>

<div class="shell">
	<Sidebar />

	<main class="content">
		{@render children()}
	</main>

	<BottomNav />
</div>

<SearchDialog />

<style>
	.shell {
		display: flex;
		min-height: 100dvh;
	}

	.content {
		flex: 1;
		min-width: 0;
	}

	@media (min-width: 768px) {
		.content {
			padding-left: 240px;
		}
	}

	@media (max-width: 767px) {
		.content {
			padding-bottom: calc(64px + env(safe-area-inset-bottom));
		}
	}
</style>
