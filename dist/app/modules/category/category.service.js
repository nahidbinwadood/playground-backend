"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryServices = void 0;
const appError_1 = require("../../errorHelpers/appError");
const generateSlug_1 = require("../../utils/generateSlug");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const blog_model_1 = require("../blog/blog.model");
const note_model_1 = require("../note/note.model");
const category_model_1 = require("./category.model");
// `order` first, then insertion — the pickers and the table both read this
// order, so renaming a category never shuffles the list under the reader.
const CATEGORY_SORT = { order: 1, createdAt: 1 };
// get all categories ==>
// Public: this is the list the blog and note forms build their selects from, and
// the list the public pages resolve names against.
const getAllCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield category_model_1.Category.find({}).sort(CATEGORY_SORT);
});
// get single category ==>
const getSingleCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield category_model_1.Category.findById(id);
    if (!response) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Category not found');
    }
    return response;
});
// A duplicate name is a readable 400 rather than a raw duplicate-key error from
// Mongo. Slugs have to stay unique — they are the handle the public filter uses.
const assertNameIsFree = (name, ignoreId) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = (0, generateSlug_1.generateSlug)(name);
    const existing = yield category_model_1.Category.findOne({ slug });
    if (existing && existing.id !== ignoreId) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, `"${name}" already exists`);
    }
    return slug;
});
// create category ==>
const createCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const slug = yield assertNameIsFree(payload.name);
    // A new category appends: it takes the slot after the last one instead of
    // colliding with the seeded order.
    const last = yield category_model_1.Category.findOne({}).sort({ order: -1 }).select('order');
    const order = ((_a = last === null || last === void 0 ? void 0 : last.order) !== null && _a !== void 0 ? _a : 0) + 1;
    return yield category_model_1.Category.create(Object.assign(Object.assign({}, payload), { slug, order }));
});
// update category ==>
const updateCategory = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield category_model_1.Category.findById(id);
    if (!isExist) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Category not found');
    }
    // findOneAndUpdate skips the model's pre-save hook, so the slug is rebuilt here
    if (payload.name) {
        payload.slug = yield assertNameIsFree(payload.name, id);
    }
    return yield category_model_1.Category.findOneAndUpdate({ _id: id }, Object.assign({}, payload), { returnDocument: 'after', runValidators: true });
});
// delete category ==>
// Refuses while anything still points at it. Mongo cascades nothing here, so
// deleting a category in use would leave blogs and notes referencing a document
// that no longer exists — and the coverage map would quietly start lying.
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield category_model_1.Category.findById(id);
    if (!isExist) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Category not found');
    }
    const [blogs, notes] = yield Promise.all([
        blog_model_1.Blog.countDocuments({ category: id }),
        note_model_1.Note.countDocuments({ category: id }),
    ]);
    if (blogs + notes > 0) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, `"${isExist.name}" is still used by ${blogs} ${blogs === 1 ? 'blog' : 'blogs'} and ${notes} ${notes === 1 ? 'note' : 'notes'} — move them to another category first`);
    }
    return yield category_model_1.Category.findByIdAndDelete(id);
});
// Used by the blog and note services: a reference is only worth storing if it
// resolves. An empty value returns early so "no change" stays a no-op.
const assertCategoryExists = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!categoryId)
        return;
    const exists = yield category_model_1.Category.exists({ _id: categoryId });
    if (!exists) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'Category does not exist');
    }
});
exports.CategoryServices = {
    getAllCategories,
    getSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    assertCategoryExists,
};
