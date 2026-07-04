import multer from 'multer';

// Memory storage use kar rahe hain taaki RAM se seedha Cloudinary pe jaye
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});