import { v2 as cloudinary } from 'cloudinary';
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
    if (result.result !== 'ok') {
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
