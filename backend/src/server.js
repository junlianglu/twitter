const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const multer = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('./config/s3Client');
const cors = require('cors');
const imageGenRoute = require('./routes/imageGenRoute');

const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Multer in-memory storage
const upload = multer({});

// Create an Express app
const app = express();

// Optionally enable CORS on Express side
app.use(express.json());
app.use(cors({
    origin: ['https://68jvlmksm2.execute-api.us-west-1.amazonaws.com/', 'https://da4x6qms77lec.cloudfront.net', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }));
app.options('*', cors());
app.use('/api/image-gen', imageGenRoute);

// Create the Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    if (token) {
      try {
        const actualToken = token.startsWith('Bearer ')
          ? token.slice(7, token.length)
          : token;
        const user = jwt.verify(actualToken, process.env.JWT_SECRET);
        return { user };
      } catch (err) {
        console.error('Invalid token:', err.message);
      }
    }
    return {};
  },
});

// Define an /upload endpoint for local files => S3
app.post('/upload', upload.array('files', 4), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // We'll collect uploaded S3 URLs
    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `uploads/${fileName}`,
          Body: file.buffer,
          ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));       
      const uploadedUrl = `https://d3dh6nv2nfj3lt.cloudfront.net/uploads/${fileName}`;
      uploadedUrls.push(uploadedUrl);
    }

    return res.json({ urls: uploadedUrls });
  } catch (err) {
    console.error('Error uploading to S3:', err);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Start the server
(async () => {
  // Must start Apollo Server before applying it as middleware
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
 app.listen(PORT, () => {
   console.log(`Server listening on port ${PORT}, GraphQL at /graphql`);
 });
})();
