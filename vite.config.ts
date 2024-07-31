import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { resolve } from 'path';
import { peerDependencies } from './package.json';
import terser from '@rollup/plugin-terser';
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  base:'./',
  plugins: [
    react(),
    libInjectCss(),
    dts({
      exclude: [
        'src/theme',
        'src/*.tsx',
        'tests'
      ],
      insertTypesEntry: true
    }),
    splitVendorChunkPlugin(),
    tsconfigPaths()
  ],
  build: {
    minify: "esbuild",
    copyPublicDir: false,
    lib: {
      name: "lib",
      entry: resolve(__dirname, './src/index.ts'),
      formats: [ 'es' ],
      fileName: "lib"
    },
    rollupOptions: {
      input: {
        index: './src/index.ts',
        componentes: './src/componentes/index.ts',
        hooks: './src/hooks/index.ts',
        utils: './src/utils/index.ts'
      },
      external: [...Object.keys(peerDependencies)],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@mui/icons-material": "@mui/icons-material",
          "@mui/material": "@mui/material",
          "@emotion/react": "@emotion/react",
          "@emotion/styled": "@emotion/styled",
        },
        inlineDynamicImports: false,
        manualChunks: function manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        plugins: [
          terser()
        ]
      },
    }
  },
})
