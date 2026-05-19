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
exports.BlogServices = void 0;
const appError_1 = require("../../errorHelpers/appError");
const generateSlug_1 = require("../../utils/generateSlug");
const blog_model_1 = require("./blog.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// get all blogs==>
const getAllBlogs = () => __awaiter(void 0, void 0, void 0, function* () {
    const getAllBlogs = yield blog_model_1.Blog.find({});
    return getAllBlogs;
});
// get all blogs==>
const getSingleBlog = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield blog_model_1.Blog.findOne({ slug: slug });
    if (response) {
        return response;
    }
    throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Invalid Slug Provided');
});
// create blogs==>
const createBlog = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield blog_model_1.Blog.create(payload);
    return response;
});
// update blog==>
const updateBlog = (_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // modify the slug==>
    if (payload.title) {
        payload.slug = (0, generateSlug_1.generateSlug)(payload.title);
    }
    const response = yield blog_model_1.Blog.findOneAndUpdate({ _id }, Object.assign({}, payload), {
        returnDocument: 'after',
        runValidators: true,
    });
    // throw error if the response not found==>
    if (!response) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Blog not found');
    }
    return response;
});
// delete blog==>
const deleteBlog = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield blog_model_1.Blog.findByIdAndDelete(id);
    if (!response) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Blog not found');
    }
    return response;
});
exports.BlogServices = {
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    getSingleBlog,
};
