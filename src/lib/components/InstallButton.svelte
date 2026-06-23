<script lang="ts">
	import { installed } from '$lib/stores/installed.svelte.js';

	let { slug, name, version }: { slug: string; name: string; version: string } = $props();

	let hovering = $state(false);

	async function handleClick(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		if (installed.isInstalling(slug)) return;

		if (installed.isInstalled(slug)) {
			await installed.uninstall(slug);
		} else {
			await installed.install(slug, name, version);
		}
	}
</script>

<button
	class="install-btn"
	class:installed={installed.isInstalled(slug)}
	class:installing={installed.isInstalling(slug)}
	onclick={handleClick}
	onmouseenter={() => { hovering = true; }}
	onmouseleave={() => { hovering = false; }}
>
	{#if installed.isInstalling(slug)}
		{installed.progress(slug)}%
	{:else if installed.isInstalled(slug)}
		{hovering ? 'Remove' : 'Installed'}
	{:else}
		Install
	{/if}
</button>

<style>
	.install-btn {
		padding: 5px 14px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.12s;
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
	}

	.install-btn:hover {
		border-color: var(--color-text);
		color: var(--color-text);
	}

	.install-btn.installed {
		background: var(--color-text);
		border-color: var(--color-text);
		color: var(--color-bg);
	}

	.install-btn.installed:hover {
		background: oklch(0.55 0.15 25);
		border-color: oklch(0.55 0.15 25);
		color: oklch(0.98 0 0);
	}

	.install-btn.installing {
		border-color: var(--color-text-dim);
		color: var(--color-text-dim);
		cursor: wait;
	}
</style>
