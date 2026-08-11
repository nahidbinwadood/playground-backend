import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import httpStatus from 'http-status-codes';
import cloudinary from '../config/cloudinary.config';
import { randomBytes } from 'crypto';
import { AppError } from '../errorHelpers/appError';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'playground',
      public_id: randomBytes(16).toString('hex'),
    };
  },
});

const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError(httpStatus.BAD_REQUEST, 'Only image files are allowed'));
    }
  },
});
export default multerUpload;
