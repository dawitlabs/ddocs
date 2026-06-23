<svelte:head>
	<title>Offline - ddocs</title>
</svelte:head>

<div class="offline">
	<h1 class="wordmark">ddocs</h1>
	<p class="message">You're offline</p>
	<p class="sub">Your installed documentation sets are still available.</p>
	<a href="/" class="home-link">Browse installed docs</a>
</div>

<style>
	.offline {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 80vh;
		padding: 24px;
		text-align: center;
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 900;
		letter-spacing: -0.05em;
		margin: 0 0 24px;
	}

	.message {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 8px;
	}

	.sub {
		color: var(--color-text-muted);
		font-size: 0.9375rem;
		margin: 0 0 24px;
	}

	.home-link {
		padding: 8px 20px;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: var(--color-text);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: border-color 0.12s;
	}

	.home-link:hover {
		border-color: var(--color-text-muted);
	}
</style>
