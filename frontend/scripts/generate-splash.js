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

// Same calligraphic logo path as generate-icons.js
const LOGO_PATH =
  'M 60,78 C 38,90 8,72 12,45 C 16,18 48,8 66,28 C 78,42 68,62 50,58 ' +
  'C 34,54 38,36 52,34 C 62,32 60,20 54,12 C 48,4 62,4 68,16';

function makeSplashSvg(w, h) {
  const minDim = Math.min(w, h);
  const logoSize = Math.round(minDim * 0.22);
  const scale = logoSize / 100;
  const sw = 2.8 / scale; // consistent stroke weight

  const lx = Math.round((w - logoSize) / 2);
  const ly = Math.round(h / 2 - logoSize * 0.65);

  const fontSize = Math.round(logoSize * 0.30);
  const textY = ly + logoSize + Math.round(fontSize * 1.6);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#F9F8F6"/>
  <g transform="translate(${lx},${ly}) scale(${scale})">
    <path d="${LOGO_PATH}"
      fill="none" stroke="#1A1A1A" stroke-width="${sw}"
      stroke-linecap="round" stroke-linejoin="round"/>
  </g>
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
