import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';
import { config } from '../../infrastructure/config/config';

export class S3Service {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            region: config.s3.region,
            credentials: {
                accessKeyId: config.s3.accessKeyId,
                secretAccessKey: config.s3.secretAccessKey,
                sessionToken: config.s3.sessionToken
            }
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new Error('No file provided');
        }

        const key = `publications/${Date.now()}-${file.originalname}`;

        try {
            const command = new PutObjectCommand({
                Bucket: config.s3.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3Client.send(command);

            return `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com/${key}`;
        } catch (err: any) {
            console.error('Error uploading file to S3:', err);
            console.error('Error details:', err.message, err.stack);
            throw new Error('Failed to upload file');
        }
    }
}