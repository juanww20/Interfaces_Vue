import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_DIR } from '../../utils/global-path.js';

const __dirname = UPLOADS_DIR;

const imageUploadPath = path.join(__dirname, 'uploads', 'images');

if (!fs.existsSync(imageUploadPath)) {
  fs.mkdirSync(imageUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageUploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

export const uploadImage = multer({ storage });