const sharp = require('sharp')

sharp('public/logo.png')
  .toBuffer()
  .then(async (buffer) => {
    const meta = await sharp(buffer).metadata()

    await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        const pixels = new Uint8Array(data)

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]

          if (r > 220 && g > 215 && b > 210) {
            pixels[i + 3] = 0
          }
        }

        return sharp(pixels, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4
          }
        })
        .png()
        .toFile('public/logo-transparent.png')
      })
  })
  .then(() => console.log('Done: logo-transparent.png'))
  .catch(console.error)
