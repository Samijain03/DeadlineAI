// Keep direct visits and refreshes working even without a host-wide SPA rewrite.
import { copyFile, mkdir } from 'node:fs/promises';
for (const route of ['login', 'signup', 'app']) {
  await mkdir(new URL(`../dist/${route}/`, import.meta.url), { recursive: true });
  await copyFile(new URL('../dist/index.html', import.meta.url), new URL(`../dist/${route}/index.html`, import.meta.url));
}
