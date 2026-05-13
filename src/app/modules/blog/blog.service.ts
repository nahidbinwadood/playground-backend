import { AppError } from '../../errorHelpers/appError';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';
import httpStatusCode from 'http-status-codes';

// get all blogs==>
const getAllBlogs = async () => {
  const getAllBlogs = await Blog.find({});

  return getAllBlogs;
};

// create blogs==>
const createBlog = async (payload: Partial<IBlog>) => {
  const response = await Blog.create(payload);

  return response;
};

// update blog==>
const updateBlog = async (blogId, payload) => {};

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
};
