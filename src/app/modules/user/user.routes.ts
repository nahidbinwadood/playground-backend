import { Router } from 'express';
import checkAuth from '../../middlewares/checkAuth';
import { UserController } from './user.controller';

const router = Router();

// get all users==>
router.get('/get-all', checkAuth('admin'), UserController.getAllUsers);

export const userRoutes = router;
