import { Router } from 'express';
import { ReminderControllers } from './reminder.controller';

const router = Router();

// deliberately NOT behind checkAuth — the scheduler has no JWT. Auth is
// verified inside the controller, which accepts either the x-reminder-secret
// header (external scheduler) or Vercel Cron's Authorization: Bearer header.
// Never leave this unprotected.
router.get('/check', ReminderControllers.checkReminders);

export const ReminderRoutes = router;
