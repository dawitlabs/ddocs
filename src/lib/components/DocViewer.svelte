<script lang="ts">
	import { goto } from '$app/navigation';

	let { html, slug }: { html: string; slug: string } = $props();

	let containerEl = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!containerEl || !html) return;

		const handleClick = (e: MouseEvent) => {
			const anchor = (e.target as HTMLElement).closest('a');
			if (!anchor) return;

			const href = anchor.getAttribute('href');
			if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;

			e.preventDefault();
			const cleanPath = href.replace(/^\//, '').replace(/#.*$/, '');
			goto(`/docs/${slug}/${cleanPath}`);
		};

		containerEl.addEventListener('click', handleClick);
		return () => containerEl?.removeEventListener('click', handleClick);
	});

	$effect(() => {
		if (!containerEl || !html) return;

		const pres = containerEl.querySelectorAll('pre');
		for (const pre of pres) {
			if (pre.querySelector('.copy-btn')) continue;

			const btn = document.createElement('button');
			btn.className = 'copy-btn';
			btn.textContent = 'Copy';
			btn.addEventListener('click', async () => {
				const code = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
				await navigator.clipboard.writeText(code);
				btn.textContent = 'Copied';
				setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
			});

			pre.style.position = 'relative';
			pre.appendChild(btn);
		}
	});
</script>

<div bind:this={containerEl} class="doc-content">
	{@html html}
</div>

<style>
	:global(.copy-btn) {
		position: absolute;
		top: 6px;
		right: 6px;
		padding: 3px 8px;
		font-size: 0.6875rem;
		font-family: var(--font-mono);
		font-weight: 500;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		color: var(--color-text-dim);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.12s, color 0.12s;
	}

	:global(pre:hover .copy-btn) {
		opacity: 1;
	}

	:global(.copy-btn:hover) {
		color: var(--color-text);
	}
</style>
