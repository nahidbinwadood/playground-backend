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
exports.NoteControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = require("../../errorHelpers/appError");
const mongoose_1 = require("mongoose");
const note_service_1 = require("./note.service");
// create note ==>
const createNote = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield note_service_1.NoteServices.createNote(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'Note Created Successfully',
        data: response,
    });
}));
// get all notes — powers the tracker ==>
const getAllNotes = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // timeline/list views pass ?includeContent=false to drop the (potentially
    // large) note body; only the detail view needs it
    const includeContent = req.query.includeContent !== 'false';
    const response = yield note_service_1.NoteServices.getAllNotes({ includeContent });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'All Notes Fetched Successfully',
        data: response,
    });
}));
// get notes attached to one blog ==>
const getNotesByBlog = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const blogId = req.params.blogId;
    if (!blogId || Array.isArray(blogId)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Blog id is required');
    }
    if (!(0, mongoose_1.isValidObjectId)(blogId)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Please enter a valid blog id');
    }
    const response = yield note_service_1.NoteServices.getNotesByBlog(blogId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Notes For The Blog Fetched Successfully',
        data: response,
    });
}));
// get single note ==>
const getSingleNote = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Note id is required');
    }
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Please enter a valid id');
    }
    const response = yield note_service_1.NoteServices.getSingleNote(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Note Fetched Successfully',
        data: response,
    });
}));
// update note ==>
const updateNote = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Note id is required');
    }
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Please enter a valid id');
    }
    const response = yield note_service_1.NoteServices.updateNote(id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Note Has Been Updated Successfully',
        data: response,
    });
}));
// delete note ==>
const deleteNote = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Note id is required');
    }
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Please enter a valid id');
    }
    yield note_service_1.NoteServices.deleteNote(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Note Deleted Successfully',
    });
}));
exports.NoteControllers = {
    createNote,
    getAllNotes,
    getNotesByBlog,
    getSingleNote,
    updateNote,
    deleteNote,
};
