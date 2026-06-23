import { browser } from '$app/environment';

type ThemeMode = 'dark' | 'light' | 'system';

class ThemeState {
	mode = $state<ThemeMode>('dark');
	resolved = $state<'dark' | 'light'>('dark');

	init() {
		if (!browser) return;
		const saved = localStorage.getItem('ddocs-theme') as ThemeMode | null;
		if (saved) this.mode = saved;
		this.resolve();
	}

	toggle() {
		if (this.mode === 'dark') this.mode = 'light';
		else if (this.mode === 'light') this.mode = 'system';
		else this.mode = 'dark';

		this.resolve();
		if (browser) localStorage.setItem('ddocs-theme', this.mode);
	}

	setMode(mode: ThemeMode) {
		this.mode = mode;
		this.resolve();
		if (browser) localStorage.setItem('ddocs-theme', this.mode);
	}

	private resolve() {
		if (this.mode === 'system') {
			this.resolved = browser && matchMedia('(prefers-color-scheme: light)').matches
				? 'light'
				: 'dark';
		} else {
			this.resolved = this.mode;
		}

		if (browser) {
			document.documentElement.setAttribute(
				'data-theme',
				this.resolved,
			);
			const metaColor = this.resolved === 'dark' ? '#0a0a0a' : '#fcfcfc';
			document.querySelector('meta[name="theme-color"]')?.setAttribute('content', metaColor);
		}
	}
}

export const theme = new ThemeState();
