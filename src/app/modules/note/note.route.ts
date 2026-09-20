import { Router } from 'express';
import { NoteControllers } from './note.controller';
import checkAuth from '../../middlewares/checkAuth';
import validateRequest from '../../middlewares/validateRequest';
import { createNoteSchema, updateNoteSchema } from './note.validation';

const router = Router();

// create note ==>
router.post(
  '/create',
  checkAuth('admin'),
  validateRequest(createNoteSchema),
  NoteControllers.createNote
);

// get all notes — powers the tracker ==>
router.get('/', checkAuth('admin'), NoteControllers.getAllNotes);

// get notes attached to one blog ==>
// MUST be declared before /:id — otherwise Express matches the literal "blog"
// as :id and every by-blog lookup 404s
router.get('/blog/:blogId', checkAuth('admin'), NoteControllers.getNotesByBlog);

// get single note ==>
router.get('/:id', checkAuth('admin'), NoteControllers.getSingleNote);

// update note ==>
router.patch(
  '/:id',
  checkAuth('admin'),
  validateRequest(updateNoteSchema),
  NoteControllers.updateNote
);

// delete note ==>
router.delete('/:id', checkAuth('admin'), NoteControllers.deleteNote);

export const NoteRoutes = router;
