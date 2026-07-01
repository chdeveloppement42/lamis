const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // 1. Login as Admin to get a token (so we bypass Provider validation for testing media upload)
    console.log('Logging in as admin...');
    const loginRes = await axios.post('http://localhost:3000/auth/login', {
      email: 'admin@immolamis.com',
      password: '0000'
    });
    const token = loginRes.data.access_token;

    // 2. Upload an image
    console.log('Uploading image...');
    const formData = new FormData();
    formData.append('images', fs.createReadStream(path.join(__dirname, 'test_listing.jpg')));

    const uploadRes = await axios.post('http://localhost:3000/media/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload successful! Response:', uploadRes.data);

    // 3. Verify file exists on disk
    const url = uploadRes.data.urls[0];
    const filepath = path.join(__dirname, url);
    if (fs.existsSync(filepath)) {
      console.log('✅ File verified on disk:', filepath);
      const stat = fs.statSync(filepath);
      console.log(`File size: ${(stat.size / 1024).toFixed(2)} KB`);
      if (filepath.endsWith('.webp')) {
         console.log('✅ File is successfully formatted to WebP');
      }
    } else {
      console.error('❌ File not found on disk:', filepath);
    }
  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
}

testUpload();
