import dotenv from 'dotenv';
dotenv.config();

export const config = {
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    analyticsServiceUrl: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004',
    publicationServiceUrl: process.env.PUBLICATION_SERVICE_URL || 'http://localhost:3005',
};
