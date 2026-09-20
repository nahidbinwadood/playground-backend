"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteRoutes = void 0;
const express_1 = require("express");
const note_controller_1 = require("./note.controller");
const checkAuth_1 = __importDefault(require("../../middlewares/checkAuth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const note_validation_1 = require("./note.validation");
const router = (0, express_1.Router)();
// create note ==>
router.post('/create', (0, checkAuth_1.default)('admin'), (0, validateRequest_1.default)(note_validation_1.createNoteSchema), note_controller_1.NoteControllers.createNote);
// get all notes — powers the tracker ==>
router.get('/', (0, checkAuth_1.default)('admin'), note_controller_1.NoteControllers.getAllNotes);
// get notes attached to one blog ==>
// MUST be declared before /:id — otherwise Express matches the literal "blog"
// as :id and every by-blog lookup 404s
router.get('/blog/:blogId', (0, checkAuth_1.default)('admin'), note_controller_1.NoteControllers.getNotesByBlog);
// get single note ==>
router.get('/:id', (0, checkAuth_1.default)('admin'), note_controller_1.NoteControllers.getSingleNote);
// update note ==>
router.patch('/:id', (0, checkAuth_1.default)('admin'), (0, validateRequest_1.default)(note_validation_1.updateNoteSchema), note_controller_1.NoteControllers.updateNote);
// delete note ==>
router.delete('/:id', (0, checkAuth_1.default)('admin'), note_controller_1.NoteControllers.deleteNote);
exports.NoteRoutes = router;
