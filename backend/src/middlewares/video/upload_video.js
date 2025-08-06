// middlewares/uploadVideo.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_DIR } from '../../utils/global-path.js';

const __dirname = UPLOADS_DIR;

const videoUploadPath = path.join(__dirname, 'uploads', 'videos');
if (!fs.existsSync(videoUploadPath)) {
  fs.mkdirSync(videoUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videoUploadPath),
  filename: (req, file, cb) => {
    const timestamp = Date.now();

    // 1. Extraer nombre sin extensión y sanitizar
    const originalName = path.parse(file.originalname).name;
    const sanitizedName = originalName
      .toLowerCase()
      .replace(/\s+/g, '-')           // reemplaza espacios por guiones
      .replace(/[^a-z0-9\-]/g, '');   // elimina caracteres especiales

    // 2. Extraer extensión
    const extension = path.extname(file.originalname).toLowerCase();

    // 3. Concatenar todo
    const uniqueName = `${timestamp}-${sanitizedName}${extension}`;
    cb(null, uniqueName);
  }
});

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 500 }, // 500MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/mkv', 'video/webm'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type, only MP4, MKV, and WEBM are allowed'));
  }
});
