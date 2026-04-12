const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../public/splash');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const splashSizes = [
  { w: 640,  h: 1136, name: 'splash-640x1136' },
  { w: 750,  h: 1334, name: 'splash-750x1334' },
  { w: 1242, h: 2208, name: 'splash-1242x2208' },
  { w: 1125, h: 2436, name: 'splash-1125x2436' },
  { w: 828,  h: 1792, name: 'splash-828x1792' },
  { w: 1242, h: 2688, name: 'splash-1242x2688' },
  { w: 1170, h: 2532, name: 'splash-1170x2532' },
  { w: 1284, h: 2778, name: 'splash-1284x2778' },
  { w: 2048, h: 2732, name: 'splash-2048x2732' },
  { w: 1668, h: 2388, name: 'splash-1668x2388' },
  { w: 1536, h: 2048, name: 'splash-1536x2048' },
];

function makeSplashSvg(w, h) {
  const minDim = Math.min(w, h);
  const iconSize = Math.round(minDim * 0.22);
  const iconR = Math.round(iconSize * 0.25);

  // L geometry
  const pad = Math.round(iconSize * 0.20);
  const inner = iconSize - 2 * pad;
  const sw = Math.round(inner * 0.30);
  const lH = inner;
  const lW = Math.round(inner * 0.68);
  const lx = pad + Math.round((inner - lW) / 2);
  const ly = pad;
  const br = Math.round(sw * 0.18);

  // Icon position: slightly above center
  const ix = Math.round((w - iconSize) / 2);
  const iy = Math.round(h / 2 - iconSize * 0.65);

  // L bars offset by icon position
  const vlx = ix + lx, vly = iy + ly, vlw = sw, vlh = lH;
  const hlx = ix + lx, hly = iy + ly + lH - sw, hlw = lW, hlh = sw;

  // "Lien" text below icon
  const fontSize = Math.round(iconSize * 0.30);
  const textY = iy + iconSize + Math.round(fontSize * 1.6);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#F9F8F6"/>
  <rect x="${ix}" y="${iy}" width="${iconSize}" height="${iconSize}" rx="${iconR}" fill="#1A1A1A"/>
  <rect x="${vlx}" y="${vly}" width="${vlw}" height="${vlh}" rx="${br}" fill="#C6A47E"/>
  <rect x="${hlx}" y="${hly}" width="${hlw}" height="${hlh}" rx="${br}" fill="#C6A47E"/>
  <text
    x="${w / 2}" y="${textY}"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${fontSize}"
    fill="#1A1A1A"
    text-anchor="middle"
    font-weight="500"
  >Lien</text>
</svg>`;
}

async function run() {
  for (const { w, h, name } of splashSizes) {
    await sharp(Buffer.from(makeSplashSvg(w, h)))
      .png()
      .toFile(path.join(outDir, `${name}.png`));
    console.log(`✓ ${name}.png`);
  }
  console.log('\nAll splash screens generated!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
