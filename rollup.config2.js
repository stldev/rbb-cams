/* eslint-disable import/no-extraneous-dependencies */
import replace from '@rollup/plugin-replace';
// import dotenv from 'dotenv/config';
import 'dotenv/config';

// dotenv.config();

export default {
  input: './rbb-sw.js',
  output: {
    format: 'es',
    dir: 'public',
  },
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
  ],
};
