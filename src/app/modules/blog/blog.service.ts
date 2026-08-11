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
    if (isExistSameSlug) {
      throw new AppError(
        httpStatusCode.BAD_REQUEST,
        'Another blog exists with the same title'
      );
    }
  }

  const session = await Blog.startSession();
  session.startTransaction();
  try {
    const response = await Blog.findOneAndUpdate(
      { _id },
      { ...payload },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    // delete the previous image==>
    if (payload.coverImage && payload.deleteImageUrl) {
      await deleteImageFromCloudinary(payload.deleteImageUrl);
    }

    await session.commitTransaction();
    session.endSession();
    return response;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw new AppError(httpStatusCode.BAD_REQUEST, 'Failed to update the blog');
  }
};

// delete blog==>
const deleteBlog = async (id: string) => {
  const response = await Blog.findByIdAndDelete(id);
  if (!response) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Blog not found');
  }

  return response;
};

export const BlogServices = {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getSingleBlog,
};
