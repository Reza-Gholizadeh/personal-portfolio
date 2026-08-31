import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Served from https://reza-gholizadeh.github.io/personal-portfolio/, so assets
  // must resolve against that subpath rather than the domain root.
  base: '/personal-portfolio/',
  plugins: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
});
