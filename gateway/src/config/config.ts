import dotenv from 'dotenv';
dotenv.config();

export const config = {
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    analyticsServiceUrl: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3002',
    publicationServiceUrl: process.env.PUBLICATION_SERVICE_URL || 'http://localhost:3003',
};
