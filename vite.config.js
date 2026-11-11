import { defineConfig } from 'vite';

export default defineConfig({
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
});
