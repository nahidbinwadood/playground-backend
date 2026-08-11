import multer from 'multer';
import httpStatus from 'http-status-codes';
import { AppError } from '../errorHelpers/appError';

const multerUpload = multer({
  storage: multer.memoryStorage(),
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
