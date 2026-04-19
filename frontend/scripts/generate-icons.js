const sharp = require('sharp');
const fs = require('fs');

if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

async function generateIcons() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  console.log('Generating PWA icons from transparent logo...');

  for (const size of sizes) {
    const padding = Math.floor(size * 0.2);
    const logoSize = size - (padding * 2);

    const logoBuffer = await sharp('public/logo.png')
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 247, g: 245, b: 242, alpha: 255 }
      }
    })
    .composite([{ input: logoBuffer, top: padding, left: padding }])
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);

    console.log(`✓ ${size}x${size}`);
  }

  // Maskable icon
  const mp = Math.floor(512 * 0.2);
  const ml = 512 - (mp * 2);
  const mb = await sharp('public/logo.png')
    .resize(ml, ml, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512, height: 512, channels: 4,
      background: { r: 247, g: 245, b: 242, alpha: 255 }
    }
  })
  .composite([{ input: mb, top: mp, left: mp }])
  .png()
  .toFile('public/icons/icon-maskable-512.png');
  console.log('✓ maskable 512x512');

  // Apple touch icon (180x180)
  const atp = Math.floor(180 * 0.2);
  const atl = 180 - (atp * 2);
  const atb = await sharp('public/logo.png')
    .resize(atl, atl, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 180, height: 180, channels: 4,
      background: { r: 247, g: 245, b: 242, alpha: 255 }
    }
  })
  .composite([{ input: atb, top: atp, left: atp }])
  .png()
  .toFile('public/icons/apple-touch-icon.png');
  console.log('✓ apple-touch-icon 180x180');

  // Favicon (32x32)
  const fp = Math.floor(32 * 0.15);
  const fl = 32 - (fp * 2);
  const fb = await sharp('public/logo.png')
    .resize(fl, fl, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 32, height: 32, channels: 4,
      background: { r: 247, g: 245, b: 242, alpha: 255 }
    }
  })
  .composite([{ input: fb, top: fp, left: fp }])
  .png()
  .toFile('public/favicon.png');
  console.log('✓ favicon 32x32');

  // Favicon 16x16
  const f16p = Math.floor(16 * 0.15);
  const f16l = 16 - (f16p * 2);
  const f16b = await sharp('public/logo.png')
    .resize(f16l, f16l, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 16, height: 16, channels: 4,
      background: { r: 247, g: 245, b: 242, alpha: 255 }
    }
  })
  .composite([{ input: f16b, top: f16p, left: f16p }])
  .png()
  .toFile('public/favicon-16x16.png');

  await sharp({
    create: {
      width: 32, height: 32, channels: 4,
      background: { r: 247, g: 245, b: 242, alpha: 255 }
    }
  })
  .composite([{ input: fb, top: fp, left: fp }])
  .png()
  .toFile('public/favicon-32x32.png');

  console.log('All icons generated!');
}

generateIcons().catch(console.error);
