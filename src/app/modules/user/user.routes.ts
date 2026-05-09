import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { createUserSchema, loginUserSchema } from './userSchema';

const userRoutes = Router();

// create user==>
userRoutes.post(
  '/create',
  validateRequest(createUserSchema),
  UserController.createUser
);

// get all users==>
userRoutes.get('/', UserController.getAllUsers);

// login ==>
userRoutes.post(
  '/login',
  validateRequest(loginUserSchema),
  UserController.loginUser
);

export default userRoutes;
