import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

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
