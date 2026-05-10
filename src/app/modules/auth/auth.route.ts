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

const authRoutes = Router();

// routes==>

// register==>
authRoutes.post(
  '/create',
  validateRequest(createUserSchema),
  AuthControllers.createUser
);

// login==>
authRoutes.post(
  '/login',
  validateRequest(loginUserSchema),
  AuthControllers.loginUser
);

// logout==>
authRoutes.post('/logout', checkAuth(), AuthControllers.logOut);

// get personal info==>
authRoutes.get('/me', checkAuth(), AuthControllers.getProfile);

// update profile==>
authRoutes.patch(
  '/me',
  checkAuth(),
  validateRequest(updateUserSchema),
  AuthControllers.updateProfile
);

// change password==>
authRoutes.post(
  '/change-password',
  validateRequest(changePasswordSchema),
  checkAuth(),
  AuthControllers.changePassword
);

export default authRoutes;
