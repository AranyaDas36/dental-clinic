import multer from 'multer';
import { AppError } from './error-handler.js';

const storage = multer.memoryStorage();

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      cb(new AppError(422, 'INVALID_FILE_TYPE', 'Only image uploads are allowed'));
      return;
    }
    cb(null, true);
  },
});
