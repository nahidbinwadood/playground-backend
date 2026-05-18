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
exports.BlogControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const blog_service_1 = require("./blog.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = require("../../errorHelpers/appError");
const mongoose_1 = require("mongoose");
// get all blogs==>
const getAllBlogs = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield blog_service_1.BlogServices.getAllBlogs();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'All Blogs Data Fetched Successfully',
        data: response,
    });
}));
// get single blog==>
const getSingleBlog = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Blog id is required');
    }
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Blog id must be a valid id');
    }
    const response = yield blog_service_1.BlogServices.getSingleBlog(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'All Blogs Data Fetched Successfully',
        data: response,
    });
}));
// create blog==>
const createBlog = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield blog_service_1.BlogServices.createBlog(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'Blog Created Successfully',
        data: response,
    });
}));
// update blog==>
const updateBlog = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // if the id is not available==>
    if (!id || Array.isArray(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Blog is is required');
    }
    // if the id is invalid==>
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Please enter a valid id');
    }
    const response = yield blog_service_1.BlogServices.updateBlog(id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Blog Has Been Updated Successfully',
        data: response,
    });
}));
// delete blog==>
const deleteBlog = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // if the id is not available==>
    if (!id || Array.isArray(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Blog is is required');
    }
    // if the id is invalid==>
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Please enter a valid id');
    }
    const response = yield blog_service_1.BlogServices.deleteBlog(id);
    if (response) {
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: 'Blog Deleted Successfully',
        });
    }
}));
exports.BlogControllers = {
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    getSingleBlog,
};
