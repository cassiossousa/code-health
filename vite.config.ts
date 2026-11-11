import { defineConfig } from 'vite';
import { getViteBaseConfig } from './vite.base.config';

export default defineConfig(({ command }) => {
  return getViteBaseConfig(command);
});
