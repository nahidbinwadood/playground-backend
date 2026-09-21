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
exports.CategoryControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = require("../../errorHelpers/appError");
const mongoose_1 = require("mongoose");
const category_service_1 = require("./category.service");
// the id guard every by-id route needs, kept in one place ==>
const requireValidId = (id) => {
    if (!id || Array.isArray(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Category id is required');
    }
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Please enter a valid id');
    }
    return id;
};
// get all categories — PUBLIC, no auth guard: the public blog pages and the
// admin forms both build their selects from this list ==>
const getAllCategories = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield category_service_1.CategoryServices.getAllCategories();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'All Categories Fetched Successfully',
        data: response,
    });
}));
// get single category — PUBLIC ==>
const getSingleCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = requireValidId(req.params.id);
    const response = yield category_service_1.CategoryServices.getSingleCategory(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Category Fetched Successfully',
        data: response,
    });
}));
// create category — admin only ==>
const createCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield category_service_1.CategoryServices.createCategory(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'Category Created Successfully',
        data: response,
    });
}));
// update category — admin only ==>
const updateCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = requireValidId(req.params.id);
    const response = yield category_service_1.CategoryServices.updateCategory(id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Category Has Been Updated Successfully',
        data: response,
    });
}));
// delete category — admin only ==>
const deleteCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = requireValidId(req.params.id);
    yield category_service_1.CategoryServices.deleteCategory(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Category Deleted Successfully',
    });
}));
exports.CategoryControllers = {
    getAllCategories,
    getSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory,
};
