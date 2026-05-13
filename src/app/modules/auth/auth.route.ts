import { Router } from 'express';
import { AuthControllers } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import {
  changePasswordSchema,
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
} from '../user/userSchema';
import checkAuth from '../../middlewares/checkAuth';

const router = Router();

// routes==>

// register==>
router.post(
  '/create',
  validateRequest(createUserSchema),
  AuthControllers.createUser
);

// login==>
router.post(
  '/login',
  validateRequest(loginUserSchema),
  AuthControllers.loginUser
);

// logout==>
router.post('/logout', checkAuth(), AuthControllers.logOut);

// get personal info==>
router.get('/me', checkAuth(), AuthControllers.getProfile);

// update profile==>
router.patch(
  '/me',
  checkAuth(),
  validateRequest(updateUserSchema),
  AuthControllers.updateProfile
);

// change password==>
router.post(
  '/change-password',
  validateRequest(changePasswordSchema),
  checkAuth(),
  AuthControllers.changePassword
);

export const authRoutes = router;
