import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import manifest from './manifest.json';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), crx({ manifest })],
	optimizeDeps: {
		include: ['@emotion/styled'],
	},
	server: {
		cors: {
			origin: [/chrome-extension:\/\//],
		},
	},
});
