// news-image-20261124 — headline page for Tuesday, 24 November 2026.
// The image was drawn at build time and sits beside this file as entry.png;
// this program validates it and copies it to the grader's output directory.
// The page is square on purpose: the judge sees one front page, not a strip.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1024 * 1024;
const MAX_SIDE = 1024;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

interface Dimensions {
  width: number;
  height: number;
}

function readDimensions(png: Buffer): Dimensions {
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (png[i] !== PNG_SIGNATURE[i]) {
      throw new Error('entry.png is not a PNG: bad signature');
    }
  }
  if (png.length > MAX_BYTES) {
    throw new Error(`entry.png is ${png.length} bytes, over the ${MAX_BYTES} limit`);
  }
  // The IHDR chunk is always first: 8 signature bytes, 4 length, 4 type, then w/h.
  if (png.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('entry.png has no IHDR chunk');
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width < 1 || height < 1 || width > MAX_SIDE || height > MAX_SIDE) {
    throw new Error(`entry.png is ${width}x${height}, over the ${MAX_SIDE}px limit`);
  }
  if (width !== height) {
    throw new Error(`entry.png is ${width}x${height}; the page is drawn square`);
  }
  return { width, height };
}

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.png');

const image = readFileSync(source);
const { width, height } = readDimensions(image);

mkdirSync(outDir, { recursive: true });
writeFileSync(target, image);

const written = readFileSync(target);
if (!written.equals(image)) {
  throw new Error('the copy does not match the source image');
}

console.log(`entry.png ${image.length} bytes ${width}x${height} -> ${target}`);
