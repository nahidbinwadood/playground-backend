import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import { AppError } from '../../errorHelpers/appError';
import { isValidObjectId } from 'mongoose';
import { CategoryServices } from './category.service';

// the id guard every by-id route needs, kept in one place ==>
const requireValidId = (id: string | string[] | undefined) => {
  if (!id || Array.isArray(id)) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Category id is required');
  }

  if (!isValidObjectId(id)) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Please enter a valid id');
  }

  return id;
};

// get all categories — PUBLIC, no auth guard: the public blog pages and the
// admin forms both build their selects from this list ==>
const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await CategoryServices.getAllCategories();

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'All Categories Fetched Successfully',
      data: response,
    });
  }
);

// get single category — PUBLIC ==>
const getSingleCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = requireValidId(req.params.id);

    const response = await CategoryServices.getSingleCategory(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Category Fetched Successfully',
      data: response,
    });
  }
);

// create category — admin only ==>
const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await CategoryServices.createCategory(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.CREATED,
      message: 'Category Created Successfully',
      data: response,
    });
  }
);

// update category — admin only ==>
const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = requireValidId(req.params.id);

    const response = await CategoryServices.updateCategory(id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Category Has Been Updated Successfully',
      data: response,
    });
  }
);

// delete category — admin only ==>
const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = requireValidId(req.params.id);

    await CategoryServices.deleteCategory(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Category Deleted Successfully',
    });
  }
);

export const CategoryControllers = {
  getAllCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
