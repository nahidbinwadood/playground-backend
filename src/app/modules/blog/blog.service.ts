import { deleteImageFromCloudinary } from '../../config/cloudinary.config';
import { AppError } from '../../errorHelpers/appError';
import { generateSlug } from '../../utils/generateSlug';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';
import httpStatusCode from 'http-status-codes';

// get all blogs==>
const getAllBlogs = async () => {
  const getAllBlogs = await Blog.find({});

  return getAllBlogs;
};

// get all blogs==>
const getSingleBlog = async (slug: string) => {
  const response = await Blog.findOne({ slug: slug });
  if (response) {
    return response;
  }

  throw new AppError(httpStatusCode.NOT_FOUND, 'Invalid Slug Provided');
};

// create blogs==>
const createBlog = async (payload: Partial<IBlog>) => {
  const response = await Blog.create(payload);

  return response;
};

// update blog==>
const updateBlog = async (_id: string, payload: Partial<IBlog>) => {
  const session = await Blog.startSession();
  session.startTransaction();

  try {
    // throw error if the blog does not exist==>
    const isExist = await Blog.findById(_id);
    if (!isExist) {
      throw new AppError(httpStatusCode.BAD_REQUEST, 'Blog does not exist');
    }

    // modify the slug==>
    if (payload.title) {
      payload.slug = generateSlug(payload.title);

      // throw error if the slug already exists==>
      const isExistSameSlug = await Blog.findOne({ slug: payload.slug });
      if (isExistSameSlug && isExistSameSlug?.id !== isExist.id) {
        throw new AppError(
          httpStatusCode.BAD_REQUEST,
          'Another blog exists with the same title'
        );
      }
    }

    // single-doc update is atomic in mongo — no transaction needed
    const response = await Blog.findOneAndUpdate(
      { _id },
      { ...payload },
      {
        returnDocument: 'after',
        runValidators: true,
        session,
      }
    );

    // delete the previous image AFTER the db update — best-effort,
    if (payload.coverImage && payload.deleteImageUrl) {
      console.log(isExist.coverImage, payload.deleteImageUrl);
      // throw error if the delete image url is invalid==>
      if (payload.deleteImageUrl !== isExist.coverImage) {
        throw new AppError(
          httpStatusCode.BAD_REQUEST,
          'Invalid Delete Image URL Provided'
        );
      }

      try {
        await deleteImageFromCloudinary(payload.deleteImageUrl);
      } catch (error) {
        console.log('Failed to delete old cover image:', error);
      }
    }

    await session.commitTransaction();
    session.endSession();
    return response;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      error?.message || 'Failed to update the blog'
    );
  }
};

// delete blog==>
const deleteBlog = async (id: string) => {
  const session = await Blog.startSession();
  session.startTransaction();
  try {
    const isExist = await Blog.findById(id);
    // throw error if the blog does not exist==>
    if (!isExist) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Blog not found');
    }
    const response = await Blog.findByIdAndDelete(id);

    // delete the cover image from cloudinary after delete==>
    if (isExist?.coverImage) {
      await deleteImageFromCloudinary(isExist.coverImage);
    }

    await session.commitTransaction();
    session.endSession();
    return response;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      error?.message || 'Failed to delete the blog'
    );
  }
};

export const BlogServices = {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getSingleBlog,
};
