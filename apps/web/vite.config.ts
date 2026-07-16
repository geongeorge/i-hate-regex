import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
    nitro(),
  ],
})
