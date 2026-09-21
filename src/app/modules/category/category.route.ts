import { Router } from 'express';
import { CategoryControllers } from './category.controller';
import checkAuth from '../../middlewares/checkAuth';
import validateRequest from '../../middlewares/validateRequest';
import {
  createCategorySchema,
  updateCategorySchema,
} from './category.validation';

const router = Router();

// ---------------------------------------------------------------------------
// Reads are PUBLIC on purpose — no checkAuth anywhere in this half. The public
// blog pages resolve a blog's category name against this list, and both admin
// forms build their selects from it, so requiring a token would mean a signed
// out visitor sees blog cards with no topic on them.
//
// Writes are NOT: an open POST here would let anyone who found the URL rename
// or delete the owner's categories, and `category` is a required reference on
// every blog and note.
// ---------------------------------------------------------------------------

// get all categories — public ==>
router.get('/', CategoryControllers.getAllCategories);

// create category — admin only; declared before /:id so the literal path is
// never matched as an id ==>
router.post(
  '/create',
  checkAuth('admin'),
  validateRequest(createCategorySchema),
  CategoryControllers.createCategory
);

// get single category — public ==>
router.get('/:id', CategoryControllers.getSingleCategory);

// update category — admin only ==>
router.patch(
  '/:id',
  checkAuth('admin'),
  validateRequest(updateCategorySchema),
  CategoryControllers.updateCategory
);

// delete category — admin only ==>
router.delete('/:id', checkAuth('admin'), CategoryControllers.deleteCategory);

export const CategoryRoutes = router;
