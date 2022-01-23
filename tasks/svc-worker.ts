const fs = require('fs').promises;

const indexHtml = './public/index.html';
const swJs = './public/sw.js';

async function modifyFiles() {
  const indexHtmlFile = await fs.readFile(indexHtml, 'utf-8');

  const indexHtmlNew = indexHtmlFile.replace(
    '.then((function(){',
    '.then((function(swReg){globalThis.swRegistration = swReg;'
  );

  await fs.writeFile(indexHtml, indexHtmlNew, 'utf-8');

  const swJsFile = await fs.readFile(swJs, 'utf-8');

  const swJsNew = swJsFile.replace(
    'if(!self.define)',
    'importScripts("rbb-sw.js");if(!self.define)'
  );

  await fs.writeFile(swJs, swJsNew, 'utf-8');
}

modifyFiles();
