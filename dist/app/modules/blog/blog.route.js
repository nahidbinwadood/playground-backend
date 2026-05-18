"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogRoutes = void 0;
const express_1 = require("express");
const blog_controller_1 = require("./blog.controller");
const checkAuth_1 = __importDefault(require("../../middlewares/checkAuth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const blog_validation_1 = require("./blog.validation");
const router = (0, express_1.Router)();
// get all blogs==>
router.get('/', blog_controller_1.BlogControllers.getAllBlogs);
// get single blog==>
router.get('/:id', blog_controller_1.BlogControllers.getSingleBlog);
// create blog==>
router.post('/create', (0, checkAuth_1.default)('admin'), (0, validateRequest_1.default)(blog_validation_1.createBlogValidationSchema), blog_controller_1.BlogControllers.createBlog);
// update blog==>
router.patch('/:id', (0, checkAuth_1.default)('admin'), (0, validateRequest_1.default)(blog_validation_1.updateBlogValidationSchema), blog_controller_1.BlogControllers.updateBlog);
// delete blog==>
router.delete('/:id', (0, checkAuth_1.default)('admin'), blog_controller_1.BlogControllers.deleteBlog);
exports.BlogRoutes = router;
