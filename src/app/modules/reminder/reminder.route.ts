import { Router } from 'express';
import { ReminderControllers } from './reminder.controller';

const router = Router();

// deliberately NOT behind checkAuth — the scheduler has no JWT. The shared
// secret header (x-reminder-secret) is verified inside the controller with
// crypto.timingSafeEqual. Never leave this unprotected.
router.get('/check', ReminderControllers.checkReminders);

export const ReminderRoutes = router;
