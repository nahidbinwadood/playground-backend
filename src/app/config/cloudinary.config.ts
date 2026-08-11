import { v2 as cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { envVars } from './env';
import httpStatus from 'http-status-codes';
import { AppError } from '../errorHelpers/appError';

const getPublicId = (url: string) =>
  url.match(/\/v\d+\/(.+?)(?:\.[^/.]+)?$/)?.[1];

cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = (buffer: Buffer): Promise<string> =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: 'playground', public_id: randomBytes(16).toString('hex') },
        (error, result) => {
          if (error || !result) {
            return reject(error ?? new Error('Cloudinary upload failed'));
          }
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });

export const deleteImageFromCloudinary = async (imageUrl: string) => {
  const public_id = getPublicId(imageUrl);
  if (!public_id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid cloudinary url, could not extract public id'
    );
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);
    // 'not found' = already deleted = goal achieved (idempotent delete)
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary destroy failed: ${result.result}`);
    }
    console.log(`Deleted Image ${public_id}`);
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to delete cloudinary image'
    );
  }
};

export default cloudinary;
