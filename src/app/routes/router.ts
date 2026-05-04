import { Router } from 'express';
import userRoutes from '../modules/user/user.routes';

const router = Router();

// declare all the routes=>
const allRoutes = [
  {
    path: '/user',
    route: userRoutes,
  },
];

allRoutes?.map((routes) => router.use(routes.path, routes.route));

export default router;
