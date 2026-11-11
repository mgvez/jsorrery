const vm = require('vm'); const fs = require('fs'); const path = require('path');
globalThis.window = globalThis; globalThis.location = { search: '' };
const data = process.env.DATA;
for (const f of ['elp.js', 'vsop-earth.js', 'vsop-mercury.js']) vm.runInThisContext(fs.readFileSync(path.join(data, f), 'utf8'));
const origLog = console.log; console.log = () => {};
require('./old-bundle.cjs');
