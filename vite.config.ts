import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import envTypedPlugin from 'vite-plugin-env-typed'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      UnoCSS(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/auto-imports.d.ts',
        eslintrc: { enabled: true },
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
        dirs: ['src/components'],
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
      envTypedPlugin(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        [env.VITE_AI_API_BASE || '/ai-api']: {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_AI_API_BASE || '/ai-api'}`), ''),
        },
        // S3 proxy — set VITE_S3_PROXY_TARGET to an S3 endpoint to enable
        ...(env.VITE_S3_PROXY_TARGET
          ? {
              '/s3-proxy': {
                target: env.VITE_S3_PROXY_TARGET,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/s3-proxy/, ''),
              },
            }
          : {}),
        // WebDAV proxy — set VITE_WEBDAV_PROXY_TARGET to a WebDAV endpoint to enable
        ...(env.VITE_WEBDAV_PROXY_TARGET
          ? {
              '/dav-proxy': {
                target: env.VITE_WEBDAV_PROXY_TARGET,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/dav-proxy/, ''),
              },
            }
          : {}),
      },
    },
    optimizeDeps: {
      include: [
        'x-markdown-vue',
        'shiki',
        'shiki-stream',
      ],
    },
  }
})
