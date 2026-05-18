import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const minioEndpoint = import.meta.env.VITE_MINIO_ENDPOINT || 'https://minio.gigante.com.br';
const accessKeyId = import.meta.env.VITE_MINIO_ACCESS_KEY || '';
const secretAccessKey = import.meta.env.VITE_MINIO_SECRET_KEY || '';
const bucketName = import.meta.env.VITE_MINIO_BUCKET || 'curriculos';

const s3Client = new S3Client({
  endpoint: minioEndpoint,
  region: 'us-east-1', // MinIO requires a region, us-east-1 is standard default
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Must be true for MinIO
});

export const uploadCurriculo = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: file,
      ContentType: file.type,
      // ACL: 'public-read' // Opcional, dependendo da política do bucket
    });

    await s3Client.send(command);
    
    // Retorna a URL pública do arquivo
    return `${minioEndpoint}/${bucketName}/${fileName}`;
  } catch (error) {
    console.error('Erro no upload para o MinIO:', error);
    throw new Error('Falha ao enviar o currículo para os servidores.');
  }
};
