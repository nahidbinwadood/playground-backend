import { NextFunction, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';
import { isValidObjectId } from 'mongoose';
import { AppError } from '../../errorHelpers/appError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AIServices } from './ai.service';

// same id guard as the note controller — reject before spending an LLM call
const noteIdFrom = (req: Request) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Note id is required');
  }

  if (!isValidObjectId(id)) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Please enter a valid id');
  }

  return id;
};

// generate recall cards for a note ==>
const generateCards = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await AIServices.generateCards(noteIdFrom(req));

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Recall Cards Generated Successfully',
      data: response,
    });
  }
);

// audit a note for possible errors ==>
const auditNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await AIServices.auditNote(noteIdFrom(req));

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Note Audited Successfully',
      data: response,
    });
  }
);

export const AIControllers = {
  generateCards,
  auditNote,
};
