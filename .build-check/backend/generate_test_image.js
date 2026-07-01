const sharp = require('sharp');

sharp({
  create: {
    width: 2000,
    height: 1000,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
  }
})
.jpeg()
.toFile('test_listing.jpg')
.then(() => console.log('Test image generated'));
