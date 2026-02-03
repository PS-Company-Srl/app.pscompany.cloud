import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'PSCompanyChat',
      fileName: () => 'pscompany-chat.js',
      formats: ['umd'],
    },
    rollupOptions: {
      output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } },
    },
    minify: 'terser',
    outDir: 'dist',
  },
  server: { port: 3001, cors: true },
});
