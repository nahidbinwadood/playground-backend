import { Router } from 'express';
import checkAuth from '../../middlewares/checkAuth';
import { AIControllers } from './ai.controller';

const router = Router();

// admin only: every call spends model quota (or money, once on a paid model),
// and audits read DRAFT notes, which are private.
// POST, not GET: each call does new, non-cacheable work.

// note → recall cards ==>
router.post('/notes/:id/cards', checkAuth('admin'), AIControllers.generateCards);

// note → possible errors ==>
router.post('/notes/:id/audit', checkAuth('admin'), AIControllers.auditNote);

export const AIRoutes = router;
