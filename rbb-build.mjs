import { readFileSync as rfs, writeFileSync as wfs } from 'node:fs';

const indexHtml = './public/index.html';

const indexHtmlText = rfs(indexHtml, { encoding: 'utf-8' });

const newValue = indexHtmlText
  .replace('.then((function()', '.then((function(swReg)')
  .replace('})).catch', ';globalThis.swRegistration = swReg;})).catch');

wfs(indexHtml, newValue, { encoding: 'utf-8' });
