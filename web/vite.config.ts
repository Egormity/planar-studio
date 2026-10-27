import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const value = (process.env.PORT ?? loadEnv(mode, process.cwd(), 'PORT').PORT)?.trim();
  const port = value ? Number(value) : undefined;
  if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  return {
    plugins: [react()],
    base: './',
    server: { host: '0.0.0.0', port: port ?? 4440, strictPort: true },
    preview: { host: '0.0.0.0', port: port ?? 4441, strictPort: true },
  };
});
