/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	// relative base so the build can be served from any sub-path (e.g. GitHub Pages)
	base: './',
	server: {
		port: 2018,
		host: true,
	},
	build: {
		outDir: 'dist',
		chunkSizeWarningLimit: 1000,
		//keep hashed build files apart from the static public/assets folder
		assetsDir: 'static',
	},
	test: {
		environment: 'node',
		setupFiles: ['./tests/setup.ts'],
		include: ['tests/**/*.test.ts'],
		testTimeout: 120000,
	},
});
