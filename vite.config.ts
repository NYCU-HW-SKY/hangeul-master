import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 移除生產環境的註釋
          comments: false,
          // 壓縮 HTML 模板中的空白
          whitespace: 'condense',
        },
      },
    }),
    viteSingleFile({
      // 移除內聯腳本和樣式中的空白
      removeViteModuleLoader: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        dead_code: true,
        unused: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        loops: true,
        inline: 3,
        collapse_vars: true,
        reduce_vars: true,
        side_effects: true,
        properties: true,
        sequences: true,
        keep_fargs: false,
        keep_fnames: false,
        typeofs: true,
        hoist_funs: true,
        hoist_props: true,
        hoist_vars: false,
        if_return: true,
        join_vars: true,
        negate_iife: true,
      },
      format: {
        comments: false,
        beautify: false,
        ascii_only: true,
      },
      mangle: {
        safari10: true,
        toplevel: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    cssMinify: 'lightningcss',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 5000,
  },
})
