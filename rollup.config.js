import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import html from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import { terser } from 'rollup-plugin-terser';
import { generateSW } from 'rollup-plugin-workbox';
import copy from 'rollup-plugin-copy';
import path from 'path';
import replace from '@rollup/plugin-replace';
import 'dotenv/config';

export default {
  input: 'index.html',
  output: {
    entryFileNames: '[hash].js',
    chunkFileNames: '[hash].js',
    assetFileNames: '[hash][extname]',
    format: 'es',
    dir: 'public',
  },
  preserveEntrySignatures: false,

  plugins: [
    replace({
      'process.env.APPSERVER_PUBLICKEY': JSON.stringify(
        `${process.env.APPSERVER_PUBLICKEY}`
      ),
      'process.env.URL_BIGIMG_LOCAL': JSON.stringify(
        `${process.env.URL_BIGIMG_LOCAL}`
      ),
      'process.env.URL_BIGIMG_CLOUD': JSON.stringify(
        `${process.env.URL_BIGIMG_CLOUD}`
      ),
      'process.env.URL_VARS_LOCAL': JSON.stringify(
        `${process.env.URL_VARS_LOCAL}`
      ),
      'process.env.URL_VARS_CLOUD': JSON.stringify(
        `${process.env.URL_VARS_CLOUD}`
      ),
    }),
    copy({
      targets: [
        { src: 'rbb-sw.js', dest: './public' },
        { src: 'manifest.webmanifest', dest: './public' },
        { src: 'assets/*.png', dest: './public' },
        { src: '*.svg', dest: './public' },
        { src: '*.ico', dest: './public' },
      ],
    }),
    /** Enable using HTML as rollup entrypoint */
    html({
      transformHtml: [
        html2 =>
          html2.replace(
            '<!-- MANIFEST -->',
            `<link rel="apple-touch-icon" href="apple-touch-icon2.png" />
            <link rel="manifest" href="./manifest.webmanifest" />`
          ),
      ],
      minify: true,
      injectServiceWorker: true,
      serviceWorkerPath: 'public/sw.js',
    }),
    /** Resolve bare module imports */
    nodeResolve(),
    /** Minify JS */
    terser(),
    /** Bundle assets references via import.meta.url */
    importMetaAssets(),
    /** Compile JS to a lower language target */
    babel({
      babelHelpers: 'bundled',
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            targets: ['last 3 Chrome major versions'],
            modules: false,
            bugfixes: true,
          },
        ],
      ],
      plugins: [
        [
          require.resolve('babel-plugin-template-html-minifier'),
          {
            modules: { lit: ['html', { name: 'css', encapsulation: 'style' }] },
            failOnError: false,
            strictCSS: true,
            htmlMinifier: {
              collapseWhitespace: true,
              conservativeCollapse: true,
              removeComments: true,
              caseSensitive: true,
              minifyCSS: true,
            },
          },
        ],
      ],
    }),
    /** Create and inject a service worker */
    generateSW({
      globIgnores: ['polyfills/*.js', 'nomodule-*.js'],
      navigateFallback: '/index.html',
      // where to output the generated sw
      swDest: path.join('public', 'sw.js'),
      // directory to match patterns against to be precached
      globDirectory: path.join('public'),
      // cache any html js and css by default
      globPatterns: ['**/*.{html,js,css,webmanifest}'],
      skipWaiting: false,
      importScripts: ['./rbb-sw.js'],
      clientsClaim: true,
      runtimeCaching: [{ urlPattern: 'polyfills/*.js', handler: 'CacheFirst' }],
    }),
  ],
};
