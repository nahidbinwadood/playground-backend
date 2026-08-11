import { Router } from 'express';
import { BlogControllers } from './blog.controller';
import checkAuth from '../../middlewares/checkAuth';
import validateRequest from '../../middlewares/validateRequest';
import {
  createBlogValidationSchema,
  updateBlogValidationSchema,
} from './blog.validation';
import multerUpload from '../../middlewares/multer-upload';

const router = Router();

// get all blogs==>
router.get('/', BlogControllers.getAllBlogs);

// get single blog==>
router.get('/:slug', BlogControllers.getSingleBlog);

// create blog==>
router.post(
  '/create',
  checkAuth('admin'),
  multerUpload.single('coverImage'),
  validateRequest(createBlogValidationSchema, 'coverImage'),
  BlogControllers.createBlog
);

// update blog==>
router.patch(
  '/:id',
  checkAuth('admin'),
  multerUpload.single('coverImage'),
  validateRequest(updateBlogValidationSchema, 'coverImage'),
  BlogControllers.updateBlog
);

// delete blog==>
router.delete('/:id', checkAuth('admin'), BlogControllers.deleteBlog);

export const BlogRoutes = router;
