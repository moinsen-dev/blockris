import { defineConfig } from "vite";

export default defineConfig({
	root: ".",
	build: {
		outDir: "dist",
		target: "es2022",
		sourcemap: true,
	},
	server: {
		port: 5173,
		strictPort: false,
		open: false,
	},
});
