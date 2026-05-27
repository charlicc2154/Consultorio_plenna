import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        origin: 'http://localhost:5174',
        hmr: {
            host: 'localhost',
            clientPort: 5174,
            protocol: 'ws',
        },
        proxy: {
            '/api': 'http://127.0.0.1:8001',
        },
    },
});
