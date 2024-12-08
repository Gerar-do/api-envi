import dotenv from 'dotenv';
dotenv.config();

export default {
  dbHost: process.env.DB_HOST || 'localhost',
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || 'password',
  dbName: process.env.DB_NAME || 'userdb',
  port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  
  jwt: {
    secret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura',
    expiresIn: '24h'
  },
  
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'default_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'default_secret',
   // sessionToken: process.env.AWS_SESSION_TOKEN, // Añade esta línea
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.S3_BUCKET_NAME || ''
  }
};