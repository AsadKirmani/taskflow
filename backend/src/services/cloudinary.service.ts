import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folderName: string,
  fileName: string
): Promise<{ secure_url: string; public_id: string; format: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `taskflow/${folderName}`, // 'avatars' ya 'attachments'
        resource_type: 'auto', // Zaroori hai taaki image/pdf sab accept ho
        public_id: `${Date.now()}-${fileName.split('.')[0]}`,
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) resolve(result as any);
      }
    );
    uploadStream.end(fileBuffer);
  });
};