import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3003,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/publications',
  jwtSecret: process.env.JWT_SECRET || 'Toledo-2001',
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || '',
    region: process.env.AWS_REGION || '',
    bucketName: process.env.S3_BUCKET_NAME || '',
  },
  postgres: {
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'comentbd',
    password: process.env.POSTGRES_PASSWORD || '211228',
    port: parseInt(process.env.POSTGRES_PORT || '5434'),
  }
};