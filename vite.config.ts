import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Endereço do site no GitHub Pages: borniotti.github.io/controle-de-gastos/
  base: '/controle-de-gastos/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testes-setup.ts'],
  },
});
