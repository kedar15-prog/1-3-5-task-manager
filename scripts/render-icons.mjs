import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateAllIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-maskable-192x192.png', size: 192 },
    { name: 'pwa-maskable-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon.png', size: 64 },
    { name: 'favicon-32x32.png', size: 32 },
  ];

  for (const target of targets) {
    const destPath = path.resolve('public', target.name);
    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(destPath);
    console.log(`Generated ${target.name} (${target.size}x${target.size})`);
  }

  // Also duplicate favicon-32x32 to favicon.ico so browsers requesting favicon.ico get a valid image
  fs.copyFileSync(path.resolve('public/favicon-32x32.png'), path.resolve('public/favicon.ico'));
  console.log('All PWA and mobile icons generated successfully with Sharp!');
}

generateAllIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
