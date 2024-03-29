import 'dotenv/config';
import rollupReplace from '@rollup/plugin-replace';
import { fromRollup } from '@web/dev-server-rollup';

const replace = fromRollup(rollupReplace);

// import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';

/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  open: '/',
  watch: !hmr,
  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  appIndex: 'index.html',

  plugins: [
    /** Use Hot Module Replacement by uncommenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),
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
  ],

  // See documentation for all available options
});
