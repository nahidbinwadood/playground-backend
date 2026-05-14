"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = require("../modules/user/user.routes");
const blog_route_1 = require("../modules/blog/blog.route");
const auth_route_1 = require("../modules/auth/auth.route");
const router = (0, express_1.Router)();
// declare all the routes=>
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_route_1.authRoutes,
    },
    {
        path: '/users',
        route: user_routes_1.userRoutes,
    },
    {
        path: '/blogs',
        route: blog_route_1.BlogRoutes,
    },
];
moduleRoutes === null || moduleRoutes === void 0 ? void 0 : moduleRoutes.map((routes) => router.use(routes.path, routes.route));
exports.default = router;
