import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'default-secret',
    services: {
        user: process.env.USER_SERVICE_URL || 'http:// 127.0.0.1:3001',
        analytics: process.env.ANALYTICS_SERVICE_URL || 'http:// 127.0.0.1:3002',
        publication: process.env.PUBLICATION_SERVICE_URL || 'http:// 127.0.0.1:3003',
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 6, // 6 requests per windowMs
    }
};