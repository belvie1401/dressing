const sharp = require('sharp');
const fs = require('fs');

// Create icons directory
if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

// LIEN brand icon — black bg + serif "LIEN" text
// with proper letter-spacing and centered design
const createSVG = (size) => `
<svg width="${size}" height="${size}"
  viewBox="0 0 ${size} ${size}"
  xmlns="http://www.w3.org/2000/svg">

  <!-- Background: rich black -->
  <rect width="${size}" height="${size}"
    fill="#111111" rx="${size * 0.22}"/>

  <!-- Gold accent line top -->
  <rect x="${size * 0.3}" y="${size * 0.22}"
    width="${size * 0.4}" height="${size * 0.025}"
    fill="#C6A47E" rx="${size * 0.012}"/>

  <!-- LIEN text centered -->
  <text
    x="${size / 2}"
    y="${size * 0.62}"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${size * 0.28}"
    font-weight="400"
    fill="#F7F5F2"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="${size * 0.04}">LIEN</text>

  <!-- Gold accent line bottom -->
  <rect x="${size * 0.3}" y="${size * 0.75}"
    width="${size * 0.4}" height="${size * 0.025}"
    fill="#C6A47E" rx="${size * 0.012}"/>

</svg>`;

// Maskable icon (no rounded corners — OS adds them)
const createMaskableSVG = (size) => `
<svg width="${size}" height="${size}"
  viewBox="0 0 ${size} ${size}"
  xmlns="http://www.w3.org/2000/svg">

  <!-- Full bleed background -->
  <rect width="${size}" height="${size}" fill="#111111"/>

  <!-- Gold accent line top -->
  <rect x="${size * 0.25}" y="${size * 0.28}"
    width="${size * 0.5}" height="${size * 0.02}"
    fill="#C6A47E"/>

  <!-- LIEN text -->
  <text
    x="${size / 2}"
    y="${size / 2}"
    font-family="Georgia, serif"
    font-size="${size * 0.26}"
    font-weight="400"
    fill="#F7F5F2"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="${size * 0.04}">LIEN</text>

  <!-- Gold accent line bottom -->
  <rect x="${size * 0.25}" y="${size * 0.72}"
    width="${size * 0.5}" height="${size * 0.02}"
    fill="#C6A47E"/>

</svg>`;

async function generateIcons() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  console.log('Generating PWA icons...');

  for (const size of sizes) {
    await sharp(Buffer.from(createSVG(size)))
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`✓ icon-${size}x${size}.png`);
  }

  // Maskable icon (for Android adaptive icons)
  await sharp(Buffer.from(createMaskableSVG(512)))
    .png()
    .toFile('public/icons/icon-maskable-512.png');
  console.log('✓ icon-maskable-512.png');

  // Apple touch icon (must be 180x180, no radius)
  await sharp(Buffer.from(createSVG(180)))
    .png()
    .toFile('public/icons/apple-touch-icon.png');
  console.log('✓ apple-touch-icon.png');

  // Favicon (32x32)
  await sharp(Buffer.from(createSVG(32)))
    .png()
    .toFile('public/favicon.png');
  console.log('✓ favicon.png');

  // Also create favicon.ico equivalent
  await sharp(Buffer.from(createSVG(32)))
    .png()
    .toFile('public/favicon-32x32.png');

  await sharp(Buffer.from(createSVG(16)))
    .png()
    .toFile('public/favicon-16x16.png');

  console.log('All icons generated!');
}

generateIcons().catch(console.error);
