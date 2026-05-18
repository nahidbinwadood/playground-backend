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
const getSingleBlog = async (id: string) => {
  const response = await Blog.findOne({ _id: id });

  return response;
};

// create blogs==>
const createBlog = async (payload: Partial<IBlog>) => {
  const response = await Blog.create(payload);

  return response;
};

// update blog==>
const updateBlog = async (_id: string, payload: Partial<IBlog>) => {
  // modify the slug==>
  if (payload.title) {
    payload.slug = generateSlug(payload.title);
  }
  const response = await Blog.findOneAndUpdate(
    { _id },
    { ...payload },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  // throw error if the response not found==>
  if (!response) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Blog not found');
  }

  return response;
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
