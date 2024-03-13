import { defineConfig } from 'vite';
import * as path from 'node:path';

const appBase = 'music-bars'

export default defineConfig({
    base: `/${appBase}`,
    build: {
        outDir: path.resolve(`../dist/${appBase}`),
    },
});
