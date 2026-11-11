import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The VSOP87 / ELP2000 series are classic scripts that register themselves on `window` (see index.html).
const dataDir = fileURLToPath(new URL('../public/assets/data/', import.meta.url));
for (const file of ['elp.js', 'vsop-earth.js', 'vsop-mercury.js']) {
	const code = readFileSync(`${dataDir}${file}`, 'utf8');
	new Function('window', code)(globalThis);
}
