import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    logLevel: 'warning',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'esbuild',
    },
    server: {
        port: 8080
    }
});
