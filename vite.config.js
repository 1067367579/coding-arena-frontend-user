import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      //前缀一旦匹配 就会触发转发机制
      "/dev-api": {
        target: "http://127.0.0.1:19090/friend",
        //此处要将URL中的dev-api删除 替换为空字符串 就形成了正确的资源路径
        rewrite: (p) => p.replace(/^\/dev-api/,""),
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('ace-builds/src-noconflict/mode-')) return 'vendor-ace-mode'
          if (id.includes('ace-builds/src-noconflict/theme-')) return 'vendor-ace-theme'
          if (id.includes('ace-builds/src-noconflict/ext-')) return 'vendor-ace-ext'
          if (id.includes('ace-builds')) return 'vendor-ace-core'
          if (id.includes('element-plus') || id.includes('@element-plus')) return 'vendor-element-plus'
          if (id.includes('/vue') || id.includes('vue-router')) return 'vendor-vue'
          return 'vendor'
        },
      },
    },
  }
})
