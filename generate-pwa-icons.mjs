// generate-pwa-icons.mjs
// Resizes public/OPA-logo.png to the two sizes required by vite.config.ts
// Run with: node generate-pwa-icons.mjs
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE = path.join(__dirname, 'public', 'OPA-logo.png');
const SIZES = [
  { size: 192, out: path.join(__dirname, 'public', 'pwa-192x192.png') },
  { size: 512, out: path.join(__dirname, 'public', 'pwa-512x512.png') },
];

for (const { size, out } of SIZES) {
  await sharp(SOURCE)
    .resize(size, size, {
      fit: 'contain',        // preserve aspect ratio
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // white padding if not square
    })
    .png()
    .toFile(out);
  console.log(`✓ Generated ${out} (${size}x${size})`);
}
