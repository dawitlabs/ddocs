<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte.js';
	import { installed } from '$lib/stores/installed.svelte.js';
	import { library } from '$lib/stores/library.svelte.js';
	import { getStorageEstimate } from '$lib/db/client.js';

	let storage = $state({ used: 0, quota: 0 });

	const installedList = $derived(
		Array.from(installed.sets.values()).sort((a, b) => a.name.localeCompare(b.name)),
	);

	onMount(async () => {
		storage = await getStorageEstimate();
	});

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
	}

	const themeLabels: Record<string, string> = {
		dark: 'Dark',
		light: 'Light',
		system: 'System',
	};
</script>

<svelte:head>
	<title>Settings - ddocs</title>
</svelte:head>

<div class="settings">
	<h1 class="page-title">Settings</h1>

	<section class="section">
		<h2 class="section-title">Appearance</h2>
		<div class="setting-row">
			<span class="setting-label">Theme</span>
			<button class="theme-toggle" onclick={() => theme.toggle()}>
				{themeLabels[theme.mode]}
			</button>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">Storage</h2>
		<div class="storage-bar-container">
			<div
				class="storage-bar"
				style="width: {storage.quota > 0 ? Math.min((storage.used / storage.quota) * 100, 100) : 0}%"
			></div>
		</div>
		<p class="storage-text">
			{formatBytes(storage.used)} used of {formatBytes(storage.quota)}
		</p>
	</section>

	<section class="section">
		<h2 class="section-title">Installed ({installedList.length})</h2>
		{#if installedList.length === 0}
			<p class="empty-text">No documentation sets installed.</p>
		{:else}
			<ul class="installed-list">
				{#each installedList as doc}
					<li class="installed-item">
						<a href="/docs/{doc.slug}" class="installed-name">{doc.name}</a>
						<span class="installed-meta">{doc.entryCount} entries</span>
						<button
							class="remove-btn"
							onclick={() => installed.uninstall(doc.slug)}
						>
							Remove
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="section">
		<h2 class="section-title">History</h2>
		<button
			class="danger-btn"
			onclick={() => library.clearAllHistory()}
			disabled={library.history.length === 0}
		>
			Clear reading history ({library.history.length} entries)
		</button>
	</section>
</div>

<style>
	.settings {
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
		padding-bottom: 24px;
		border-bottom: 1px solid var(--color-border);
	}

	.section:last-child {
		border-bottom: none;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 700;
		margin: 0 0 16px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.setting-label {
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.theme-toggle {
		padding: 6px 14px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.12s;
	}

	.theme-toggle:hover {
		border-color: var(--color-text-dim);
	}

	.storage-bar-container {
		height: 6px;
		background: var(--color-surface);
		border-radius: 3px;
		overflow: hidden;
		margin-bottom: 8px;
	}

	.storage-bar {
		height: 100%;
		background: var(--color-text-muted);
		border-radius: 3px;
		transition: width 0.3s;
	}

	.storage-text {
		font-size: 0.8125rem;
		color: var(--color-text-dim);
		margin: 0;
	}

	.installed-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.installed-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 0;
		border-bottom: 1px solid var(--color-border);
	}

	.installed-item:last-child {
		border-bottom: none;
	}

	.installed-name {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
		text-decoration: none;
	}

	.installed-name:hover {
		text-decoration: underline;
	}

	.installed-meta {
		font-size: 0.75rem;
		color: var(--color-text-dim);
	}

	.remove-btn {
		padding: 4px 10px;
		font-size: 0.75rem;
		font-weight: 500;
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-dim);
		cursor: pointer;
		transition: all 0.12s;
	}

	.remove-btn:hover {
		color: oklch(0.65 0.15 25);
		border-color: oklch(0.65 0.15 25);
	}

	.danger-btn {
		padding: 8px 16px;
		font-size: 0.8125rem;
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.12s;
	}

	.danger-btn:hover:not(:disabled) {
		color: oklch(0.65 0.15 25);
		border-color: oklch(0.65 0.15 25);
	}

	.danger-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.empty-text {
		font-size: 0.875rem;
		color: var(--color-text-dim);
		margin: 0;
	}
</style>
