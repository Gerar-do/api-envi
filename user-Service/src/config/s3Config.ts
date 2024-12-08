import { PutObjectCommand, S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from './config';

const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    //sessionToken: config.s3.sessionToken
  }
});

export async function uploadToS3(file: Buffer, key: string) {
  const command = new PutObjectCommand({
    Bucket: config.s3.bucketName,
    Key: key,
    Body: file,
  });

  try {
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw error;
  }
}

export async function getSignedImageUrl(key: string) {
  if (!key) {
    console.error('No key provided for getSignedImageUrl');
    return '';
  }

  // Limpia la key si viene con la URL completa
  const cleanKey = key.includes('amazonaws.com/') 
    ? key.split('amazonaws.com/')[1]
    : key;

  try {
    // Verifica si el objeto existe
    const headCommand = new HeadObjectCommand({
      Bucket: config.s3.bucketName,
      Key: cleanKey,
    });

    try {
      await s3Client.send(headCommand);
    } catch (headError) {
      console.error('File does not exist in S3:', cleanKey);
      return '';
    }

    const command = new GetObjectCommand({
      Bucket: config.s3.bucketName,
      Key: cleanKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 24 * 60 * 60 // 24 horas
    });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return '';
  }
}

export default s3Client;