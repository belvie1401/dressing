const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Calligraphic logo path — stylized cursive "a" from brand mark
// Drawn in a 0-100 coordinate space
const LOGO_PATH =
  'M 60,78 C 38,90 8,72 12,45 C 16,18 48,8 66,28 C 78,42 68,62 50,58 ' +
  'C 34,54 38,36 52,34 C 62,32 60,20 54,12 C 48,4 62,4 68,16';

function makeSvg(size, maskable = false) {
  const bg = '#1A1A1A';
  const stroke = '#C6A47E';
  const r = maskable ? 0 : Math.round(size * 0.22);
  const pad = maskable ? Math.round(size * 0.24) : Math.round(size * 0.14);

  const inner = size - 2 * pad;
  const scale = inner / 100;
  // Keep stroke visually consistent: thicker for small icons
  const sw = size <= 96 ? 4 : size <= 192 ? 3.2 : 2.8;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/>
  <g transform="translate(${pad},${pad}) scale(${scale})">
    <path d="${LOGO_PATH}"
      fill="none" stroke="${stroke}" stroke-width="${sw / scale}"
      stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

async function run() {
  for (const sz of sizes) {
    await sharp(Buffer.from(makeSvg(sz, false)))
      .png()
      .toFile(path.join(outDir, `icon-${sz}x${sz}.png`));
    console.log(`✓ icon-${sz}x${sz}.png`);

    if (sz === 192 || sz === 512) {
      await sharp(Buffer.from(makeSvg(sz, true)))
        .png()
        .toFile(path.join(outDir, `icon-maskable-${sz}x${sz}.png`));
      console.log(`✓ icon-maskable-${sz}x${sz}.png`);
    }
  }
  console.log('\nAll icons generated!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
