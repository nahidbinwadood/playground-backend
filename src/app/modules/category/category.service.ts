import { AppError } from '../../errorHelpers/appError';
import { generateSlug } from '../../utils/generateSlug';
import httpStatusCode from 'http-status-codes';
import { Types } from 'mongoose';
import { Blog } from '../blog/blog.model';
import { Note } from '../note/note.model';
import { Category } from './category.model';
import { ICategory } from './category.interface';

// `order` first, then insertion — the pickers and the table both read this
// order, so renaming a category never shuffles the list under the reader.
const CATEGORY_SORT = { order: 1, createdAt: 1 } as const;

// get all categories ==>
// Public: this is the list the blog and note forms build their selects from, and
// the list the public pages resolve names against.
const getAllCategories = async () => {
  return await Category.find({}).sort(CATEGORY_SORT);
};

// get single category ==>
const getSingleCategory = async (id: string) => {
  const response = await Category.findById(id);

  if (!response) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Category not found');
  }

  return response;
};

// A duplicate name is a readable 400 rather than a raw duplicate-key error from
// Mongo. Slugs have to stay unique — they are the handle the public filter uses.
const assertNameIsFree = async (name: string, ignoreId?: string) => {
  const slug = generateSlug(name);
  const existing = await Category.findOne({ slug });

  if (existing && existing.id !== ignoreId) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      `"${name}" already exists`
    );
  }

  return slug;
};

// create category ==>
const createCategory = async (payload: Partial<ICategory>) => {
  const slug = await assertNameIsFree(payload.name as string);

  // A new category appends: it takes the slot after the last one instead of
  // colliding with the seeded order.
  const last = await Category.findOne({}).sort({ order: -1 }).select('order');
  const order = (last?.order ?? 0) + 1;

  return await Category.create({ ...payload, slug, order });
};

// update category ==>
const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  const isExist = await Category.findById(id);

  if (!isExist) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Category not found');
  }

  // findOneAndUpdate skips the model's pre-save hook, so the slug is rebuilt here
  if (payload.name) {
    payload.slug = await assertNameIsFree(payload.name, id);
  }

  return await Category.findOneAndUpdate(
    { _id: id },
    { ...payload },
    { returnDocument: 'after', runValidators: true }
  );
};

// delete category ==>
// Refuses while anything still points at it. Mongo cascades nothing here, so
// deleting a category in use would leave blogs and notes referencing a document
// that no longer exists — and the coverage map would quietly start lying.
const deleteCategory = async (id: string) => {
  const isExist = await Category.findById(id);

  if (!isExist) {
    throw new AppError(httpStatusCode.NOT_FOUND, 'Category not found');
  }

  const [blogs, notes] = await Promise.all([
    Blog.countDocuments({ category: id }),
    Note.countDocuments({ category: id }),
  ]);

  if (blogs + notes > 0) {
    throw new AppError(
      httpStatusCode.BAD_REQUEST,
      `"${isExist.name}" is still used by ${blogs} ${blogs === 1 ? 'blog' : 'blogs'} and ${notes} ${notes === 1 ? 'note' : 'notes'} — move them to another category first`
    );
  }

  return await Category.findByIdAndDelete(id);
};

// Used by the blog and note services: a reference is only worth storing if it
// resolves. An empty value returns early so "no change" stays a no-op.
const assertCategoryExists = async (
  categoryId: string | Types.ObjectId | null | undefined
) => {
  if (!categoryId) return;

  const exists = await Category.exists({ _id: categoryId });

  if (!exists) {
    throw new AppError(httpStatusCode.BAD_REQUEST, 'Category does not exist');
  }
};

export const CategoryServices = {
  getAllCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  assertCategoryExists,
};
