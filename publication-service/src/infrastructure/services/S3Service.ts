import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from '../../infrastructure/config/config';

export class S3Service {
    private s3Client: S3Client;
    private baseUrl: string;

    constructor() {
        this.s3Client = new S3Client({
            region: config.s3.region,
            credentials: {
                accessKeyId: config.s3.accessKeyId,
                secretAccessKey: config.s3.secretAccessKey,
              //  sessionToken: config.s3.sessionToken
            }
        });
        
        this.baseUrl = `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com/`;
    }

    private extractKeyFromUrl(url: string): string {
        if (!url) return '';
        
        try {
            // Si es una URL completa
            if (url.startsWith('http')) {
                const fullUrl = new URL(url);
                return decodeURIComponent(fullUrl.pathname.substring(1));
            }
            
            // Si ya es una key o path relativo
            if (url.startsWith('publications/')) {
                return url;
            }
            
            return `publications/${url}`;
        } catch (error) {
            console.error('Error extracting key from URL:', error);
            return url;
        }
    }

    async uploadImage(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new Error('No file provided');
        }

        const sanitizedFilename = file.originalname.replace(/\s+/g, '-');
        const key = `publications/${Date.now()}-${sanitizedFilename}`;

        try {
            const command = new PutObjectCommand({
                Bucket: config.s3.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                // Removido el ACL ya que el bucket no lo soporta
            });

            await this.s3Client.send(command);
            
            // Retornamos la URL completa
            return `${this.baseUrl}${key}`;
        } catch (err: any) {
            console.error('Error uploading file to S3:', err);
            throw new Error('Failed to upload file');
        }
    }

    async getPresignedUrl(imageUrl: string): Promise<string> {
        if (!imageUrl) {
            throw new Error('No URL provided');
        }

        try {
            const key = this.extractKeyFromUrl(imageUrl);
            const command = new GetObjectCommand({
                Bucket: config.s3.bucketName,
                Key: key,
            });

            const presignedUrl = await getSignedUrl(this.s3Client, command, {
                expiresIn: 24 * 60 * 60 
            });

            return presignedUrl;
        } catch (error) {
            console.error('Error generating presigned URL:', error);
            return imageUrl; // Retornamos la URL original si hay error
        }
    }

    getPublicUrl(key: string): string {
        const sanitizedKey = this.extractKeyFromUrl(key);
        return `${this.baseUrl}${sanitizedKey}`;
    }

    async deleteImage(imageUrl: string): Promise<void> {
        if (!imageUrl) {
            throw new Error('No URL provided');
        }

        try {
            const key = this.extractKeyFromUrl(imageUrl);
            const command = new DeleteObjectCommand({
                Bucket: config.s3.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            throw new Error('Failed to delete file');
        }
    }
}