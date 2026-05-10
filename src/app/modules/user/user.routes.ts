import { Router } from 'express';
import checkAuth from '../../middlewares/checkAuth';
import { UserController } from './user.controller';

const userRoutes = Router();

// get all users==>
userRoutes.get('/get-all', checkAuth('admin'), UserController.getAllUsers);

export default userRoutes;
