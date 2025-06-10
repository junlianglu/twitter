const express = require('express');
const router = express.Router();
const openai = require('../config/openaiConfig');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3Client');

router.post('/', async (req, res) => {
  const { prompt, n = 1, size = '1024x1024' } = req.body;
  try {
    const response = await openai.images.generate({
      prompt,
      model: 'gpt-image-1',
      n,
      size,
      quality: "low",
    });

    // response.data is an array of images (base64)
    const s3Urls = [];
    for (let i = 0; i < response.data.length; i++) {
      const b64 = response.data[i].b64_json;
      const buffer = Buffer.from(b64, 'base64');
      // Unique file name
      const fileName = `ai-${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `uploads/${fileName}`,
        Body: buffer,
        ContentType: 'image/png',
      };
      await s3.send(new PutObjectCommand(uploadParams));
      // Use your CloudFront or S3 public URL
      const uploadedUrl = `https://d3dh6nv2nfj3lt.cloudfront.net/uploads/${fileName}`;
      s3Urls.push(uploadedUrl);
    }

    res.json({ urls: s3Urls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate or upload image', details: error.message });
  }
});

module.exports = router;