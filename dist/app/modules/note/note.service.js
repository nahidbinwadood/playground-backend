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
exports.NoteServices = void 0;
const appError_1 = require("../../errorHelpers/appError");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const blog_model_1 = require("../blog/blog.model");
const category_service_1 = require("../category/category.service");
const note_model_1 = require("./note.model");
// a note pointing at a nonexistent blog id would otherwise silently break the
// tracker's blog grouping — verify the reference on create and update ==>
const assertBlogExists = (blogId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!blogId)
        return;
    const blogExists = yield blog_model_1.Blog.exists({ _id: blogId });
    if (!blogExists) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'Blog does not exist');
    }
});
// get all notes ==>
const getAllNotes = (_a) => __awaiter(void 0, [_a], void 0, function* ({ includeContent = true, }) {
    // newest first — the timeline reads top-down
    const query = note_model_1.Note.find({}).sort({ createdAt: -1 });
    if (!includeContent) {
        query.select('-content');
    }
    return yield query;
});
// get notes attached to one blog ==>
const getNotesByBlog = (blogId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield note_model_1.Note.find({ blog: blogId }).sort({ createdAt: -1 });
});
// get single note ==>
const getSingleNote = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield note_model_1.Note.findById(id);
    if (!response) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Note not found');
    }
    return response;
});
// create note ==>
// no Cloudinary, no multipart — notes are plain JSON
const createNote = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertBlogExists(payload.blog);
    yield category_service_1.CategoryServices.assertCategoryExists(payload.category);
    const response = yield note_model_1.Note.create(payload);
    return response;
});
// update note ==>
// single-doc update is atomic in mongo — no transaction needed (unlike blogs,
// notes carry no image cleanup)
const updateNote = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertBlogExists(payload.blog);
    yield category_service_1.CategoryServices.assertCategoryExists(payload.category);
    const response = yield note_model_1.Note.findOneAndUpdate({ _id: id }, Object.assign({}, payload), {
        returnDocument: 'after',
        runValidators: true,
    });
    if (!response) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Note not found');
    }
    return response;
});
// delete note ==>
const deleteNote = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield note_model_1.Note.findByIdAndDelete(id);
    if (!response) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'Note not found');
    }
    return response;
});
exports.NoteServices = {
    getAllNotes,
    getNotesByBlog,
    getSingleNote,
    createNote,
    updateNote,
    deleteNote,
};
