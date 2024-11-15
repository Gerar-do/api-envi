import dotenv from 'dotenv';
dotenv.config();

export default {
  dbHost: process.env.DB_HOST || 'localhost',
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || 'password',
  dbName: process.env.DB_NAME || 'userdb',
  port: process.env.PORT ? parseInt(process.env.PORT) : 3002,
};
