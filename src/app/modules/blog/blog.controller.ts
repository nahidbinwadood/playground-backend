import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { BlogServices } from './blog.service';
import sendResponse from '../../utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import { AppError } from '../../errorHelpers/appError';
import { isValidObjectId, mongo } from 'mongoose';

// get all blogs==>
const getAllBlogs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await BlogServices.getAllBlogs();

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'All Blogs Data Fetched Successfully',
      data: response,
    });
  }
);

// get single blog==>
const getSingleBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

    if (!slug) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Slug is required');
    }

    const response = await BlogServices.getSingleBlog(slug);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'All Blogs Data Fetched Successfully',
      data: response,
    });
  }
);

// create blog==>
const createBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await BlogServices.createBlog(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.CREATED,
      message: 'Blog Created Successfully',
      data: response,
    });
  }
);

// update blog==>
const updateBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // if the id is not available==>
    if (!id || Array.isArray(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Blog is is required');
    }

    // if the id is invalid==>
    if (!isValidObjectId(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Please enter a valid id');
    }

    const response = await BlogServices.updateBlog(id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Blog Has Been Updated Successfully',
      data: response,
    });
  }
);

// delete blog==>
const deleteBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // if the id is not available==>
    if (!id || Array.isArray(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Blog is is required');
    }

    // if the id is invalid==>
    if (!isValidObjectId(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Please enter a valid id');
    }

    const response = await BlogServices.deleteBlog(id);

    if (response) {
      sendResponse(res, {
        success: true,
        statusCode: httpStatusCode.OK,
        message: 'Blog Deleted Successfully',
      });
    }
  }
);

export const BlogControllers = {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getSingleBlog,
};
