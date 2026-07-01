const sharp = require('sharp');

const width = 400;
const height = 100;

const svgImage = `
<svg width="${width}" height="${height}">
  <style>
    .title { fill: rgba(255, 255, 255, 0.4); font-size: 50px; font-weight: bold; font-family: sans-serif; }
  </style>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="title">Immo Lamis</text>
</svg>
`;

const svgBuffer = Buffer.from(svgImage);

sharp(svgBuffer)
  .png()
  .toFile('watermark.png')
  .then((info) => {
    console.log('Watermark created successfully', info);
  })
  .catch((err) => {
    console.error('Error creating watermark', err);
  });
