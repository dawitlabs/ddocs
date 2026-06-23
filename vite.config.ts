import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'ddocs',
				short_name: 'ddocs',
				description: 'Offline-first developer documentation',
				theme_color: '#0a0a0a',
				background_color: '#0a0a0a',
				display: 'standalone',
				icons: [
					{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
					{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
					{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
					{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
				],
				shortcuts: [
					{ name: 'Search', short_name: 'Search', url: '/?search=1', description: 'Search documentation' }
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,woff2}'],
				runtimeCaching: [
					{
						urlPattern: ({ request }) => request.mode === 'navigate',
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages-cache',
							networkTimeoutSeconds: 5,
							plugins: [
								{
									handlerDidError: async () => Response.redirect('/offline', 302)
								}
							]
						}
					}
				]
			}
		})
	]
});
