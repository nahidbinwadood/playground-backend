"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const checkAuth_1 = __importDefault(require("../../middlewares/checkAuth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const category_validation_1 = require("./category.validation");
const router = (0, express_1.Router)();
// ---------------------------------------------------------------------------
// Reads are PUBLIC on purpose — no checkAuth anywhere in this half. The public
// blog pages resolve a blog's category name against this list, and both admin
// forms build their selects from it, so requiring a token would mean a signed
// out visitor sees blog cards with no topic on them.
//
// Writes are NOT: an open POST here would let anyone who found the URL rename
// or delete the owner's categories, and `category` is a required reference on
// every blog and note.
// ---------------------------------------------------------------------------
// get all categories — public ==>
router.get('/', category_controller_1.CategoryControllers.getAllCategories);
// create category — admin only; declared before /:id so the literal path is
// never matched as an id ==>
router.post('/create', (0, checkAuth_1.default)('admin'), (0, validateRequest_1.default)(category_validation_1.createCategorySchema), category_controller_1.CategoryControllers.createCategory);
// get single category — public ==>
router.get('/:id', category_controller_1.CategoryControllers.getSingleCategory);
// update category — admin only ==>
router.patch('/:id', (0, checkAuth_1.default)('admin'), (0, validateRequest_1.default)(category_validation_1.updateCategorySchema), category_controller_1.CategoryControllers.updateCategory);
// delete category — admin only ==>
router.delete('/:id', (0, checkAuth_1.default)('admin'), category_controller_1.CategoryControllers.deleteCategory);
exports.CategoryRoutes = router;
