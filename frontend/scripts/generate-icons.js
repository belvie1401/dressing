const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function makeSvg(size, maskable = false) {
  const gold = '#C6A47E';
  const bg = '#1A1A1A';
  const r = maskable ? 0 : Math.round(size * 0.22);
  // Inner padding: more for maskable (safe zone)
  const pad = maskable ? Math.round(size * 0.20) : Math.round(size * 0.18);

  const inner = size - 2 * pad;
  const sw = Math.round(inner * 0.30); // stroke width of the L bars
  const lH = inner;                    // letter height = full inner
  const lW = Math.round(inner * 0.68); // letter total width

  // Center the L horizontally
  const lx = pad + Math.round((inner - lW) / 2);
  const ly = pad;

  // Vertical bar: left side of L
  const vx = lx, vy = ly, vw = sw, vh = lH;
  // Horizontal bar: bottom of L
  const hx = lx, hy = ly + lH - sw, hw = lW, hh = sw;

  const br = Math.round(sw * 0.18); // bar corner radius

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/>
  <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" rx="${br}" fill="${gold}"/>
  <rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="${br}" fill="${gold}"/>
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
