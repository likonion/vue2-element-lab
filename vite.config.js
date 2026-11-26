import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path'
import elementMdPlugin from './build/vite-plugin-element-md.js'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // 生产构建使用相对路径，兼容 GitHub Pages 子路径 (/vue2-element-lab/) 与本地预览
  base: command === 'build' ? './' : '/',
  plugins: [
    elementMdPlugin(),
    vue({
      include: [/\.vue$/, /\.md$/]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions']
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0'
  }
}))
