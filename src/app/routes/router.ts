import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { BlogRoutes } from '../modules/blog/blog.route';
import { authRoutes } from '../modules/auth/auth.route';

interface IRoutes {
  path: string;
  route: Router;
}

const router = Router();

// declare all the routes=>
const moduleRoutes: IRoutes[] = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/blogs',
    route: BlogRoutes,
  },
];

moduleRoutes?.map((routes) => router.use(routes.path, routes.route));

export default router;
