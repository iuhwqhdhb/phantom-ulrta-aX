import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

// Preserve the React runtime shipped with the original app.
const root = dirname(fileURLToPath(import.meta.url));
const esbuild = await import(process.env.PHANTOM_ESBUILD_PATH
  ? pathToFileURL(process.env.PHANTOM_ESBUILD_PATH).href : 'esbuild');
const read = file => readFile(resolve(root, file), 'utf8');
const result = await esbuild.build({
  absWorkingDir: root, entryPoints: ['entry.jsx'], bundle: true,
  write: false, minify: true, format: 'iife', target: ['safari15', 'chrome100'],
  plugins: [{ name: 'existing-react-runtime', setup(build) {
    build.onResolve({ filter: /^react(?:\/dom)?$|^react-dom\/client$/ }, args => ({ path: args.path, namespace: 'existing-react' }));
    build.onLoad({ filter: /.*/, namespace: 'existing-react' }, args => ({ contents: args.path === 'react' ? 'module.exports = pv.default;' : 'module.exports = bv;', loader: 'js' }));
  } }],
});
const script = await read('build/vendor-runtime.prefix.js') + result.outputFiles[0].text + '\n})();';
const styles = await read('build/styles.base.css') + '\n' + await read('interaction.css');
const imageURI = async name => 'data:image/png;base64,' + (await readFile(resolve(root, 'www', name))).toString('base64');
const manifest = JSON.parse(await read('www/manifest.webmanifest'));
manifest.icons = await Promise.all(manifest.icons.map(async icon => ({ ...icon, src: await imageURI(icon.src) })));
const manifestURI = 'data:application/manifest+json;base64,' + Buffer.from(JSON.stringify(manifest)).toString('base64');
const imageURI180 = await imageURI('icon-180.png');
const imageURI192 = await imageURI('icon-192.png');
const standalone = (await read('build/standalone.template.html'))
  .replace('__APP_STYLES__', () => styles).replace('__APP_SCRIPT__', () => script)
  .replace('__APP_MANIFEST__', () => manifestURI)
  .replace('__APP_TOUCH_ICON__', () => imageURI180)
  .replace('__APP_FAVICON__', () => imageURI192);
await writeFile(resolve(root, 'www/app.js'), script);
await writeFile(resolve(root, 'www/styles.css'), styles);
await writeFile(resolve(root, 'www/phantom-standalone.html'), standalone);
console.log('Built www/app.js, styles.css and phantom-standalone.html');
