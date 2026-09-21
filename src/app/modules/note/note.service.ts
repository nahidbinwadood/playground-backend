import { AppError } from '../../errorHelpers/appError';
import httpStatusCode from 'http-status-codes';
import { Types } from 'mongoose';
import { Blog } from '../blog/blog.model';
import { CategoryServices } from '../category/category.service';
import { INote } from './note.interface';
import { Note } from './note.model';

// a note pointing at a nonexistent blog id would otherwise silently break the
// tracker's blog grouping — verify the reference on create and update ==>
const assertBlogExists = async (
  blogId: string | Types.ObjectId | null | undefined
) => {
  if (!blogId) return;

  const blogExists = await Blog.exists({ _id: blogId });

  if (!blogExists) {
    throw new AppError(httpStatusCode.BAD_REQUEST, 'Blog does not exist');
  }
};

// get all notes ==>
const getAllNotes = async ({
  includeContent = true,
}: {
  includeContent?: boolean;
}) => {
  // newest first — the timeline reads top-down
  const query = Note.find({}).sort({ createdAt: -1 });

  if (!includeContent) {
    query.select('-content');
  }

  return await query;
};

// get notes attached to one blog ==>
const getNotesByBlog = async (blogId: string) => {
  return await Note.find({ blog: blogId }).sort({ createdAt: -1 });
};

// get single note ==>
const getSingleNote = async (id: string) => {
  const response = await Note.findById(id);

  if (!response) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Note not found');
  }

  return response;
};

// create note ==>
// no Cloudinary, no multipart — notes are plain JSON
const createNote = async (payload: Partial<INote>) => {
  await assertBlogExists(payload.blog);
  await CategoryServices.assertCategoryExists(payload.category);

  const response = await Note.create(payload);

  return response;
};

// update note ==>
// single-doc update is atomic in mongo — no transaction needed (unlike blogs,
// notes carry no image cleanup)
const updateNote = async (id: string, payload: Partial<INote>) => {
  await assertBlogExists(payload.blog);
  await CategoryServices.assertCategoryExists(payload.category);

  const response = await Note.findOneAndUpdate(
    { _id: id },
    { ...payload },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!response) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Note not found');
  }

  return response;
};

// delete note ==>
const deleteNote = async (id: string) => {
  const response = await Note.findByIdAndDelete(id);

  if (!response) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Note not found');
  }

  return response;
};

export const NoteServices = {
  getAllNotes,
  getNotesByBlog,
  getSingleNote,
  createNote,
  updateNote,
  deleteNote,
};
