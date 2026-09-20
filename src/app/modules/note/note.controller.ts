import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import { AppError } from '../../errorHelpers/appError';
import { isValidObjectId } from 'mongoose';
import { NoteServices } from './note.service';

// create note ==>
const createNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await NoteServices.createNote(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.CREATED,
      message: 'Note Created Successfully',
      data: response,
    });
  }
);

// get all notes — powers the tracker ==>
const getAllNotes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // timeline/list views pass ?includeContent=false to drop the (potentially
    // large) note body; only the detail view needs it
    const includeContent = req.query.includeContent !== 'false';

    const response = await NoteServices.getAllNotes({ includeContent });

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'All Notes Fetched Successfully',
      data: response,
    });
  }
);

// get notes attached to one blog ==>
const getNotesByBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const blogId = req.params.blogId;

    if (!blogId || Array.isArray(blogId)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Blog id is required');
    }

    if (!isValidObjectId(blogId)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Please enter a valid blog id');
    }

    const response = await NoteServices.getNotesByBlog(blogId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Notes For The Blog Fetched Successfully',
      data: response,
    });
  }
);

// get single note ==>
const getSingleNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Note id is required');
    }

    if (!isValidObjectId(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Please enter a valid id');
    }

    const response = await NoteServices.getSingleNote(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Note Fetched Successfully',
      data: response,
    });
  }
);

// update note ==>
const updateNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Note id is required');
    }

    if (!isValidObjectId(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Please enter a valid id');
    }

    const response = await NoteServices.updateNote(id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Note Has Been Updated Successfully',
      data: response,
    });
  }
);

// delete note ==>
const deleteNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Note id is required');
    }

    if (!isValidObjectId(id)) {
      throw new AppError(httpStatusCode.NOT_FOUND, 'Please enter a valid id');
    }

    await NoteServices.deleteNote(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Note Deleted Successfully',
    });
  }
);

export const NoteControllers = {
  createNote,
  getAllNotes,
  getNotesByBlog,
  getSingleNote,
  updateNote,
  deleteNote,
};
