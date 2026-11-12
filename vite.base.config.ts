import react from '@vitejs/plugin-react';
import type { UserConfig } from 'vite';

export const getViteBaseConfig = (command: 'build' | 'serve'): UserConfig => ({
  plugins: [react()],
  base: command === 'build' ? '/code-health/' : '/',
  server: {
    port: 5173,
  },
});
