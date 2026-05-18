import { Router } from 'express';
import { BlogControllers } from './blog.controller';
import checkAuth from '../../middlewares/checkAuth';
import validateRequest from '../../middlewares/validateRequest';
import {
  createBlogValidationSchema,
  updateBlogValidationSchema,
} from './blog.validation';

const router = Router();

// get all blogs==>
router.get('/', BlogControllers.getAllBlogs);

// get single blog==>
router.get('/:id', BlogControllers.getSingleBlog);

// create blog==>
router.post(
  '/create',
  checkAuth('admin'),
  validateRequest(createBlogValidationSchema),
  BlogControllers.createBlog
);

// update blog==>
router.patch(
  '/:id',
  checkAuth('admin'),
  validateRequest(updateBlogValidationSchema),
  BlogControllers.updateBlog
);

// delete blog==>
router.delete('/:id', checkAuth('admin'), BlogControllers.deleteBlog);

export const BlogRoutes = router;
