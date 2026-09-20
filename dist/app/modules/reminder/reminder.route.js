"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderRoutes = void 0;
const express_1 = require("express");
const reminder_controller_1 = require("./reminder.controller");
const router = (0, express_1.Router)();
// deliberately NOT behind checkAuth — the scheduler has no JWT. The shared
// secret header (x-reminder-secret) is verified inside the controller with
// crypto.timingSafeEqual. Never leave this unprotected.
router.get('/check', reminder_controller_1.ReminderControllers.checkReminders);
exports.ReminderRoutes = router;
