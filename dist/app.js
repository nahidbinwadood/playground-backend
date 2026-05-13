"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sendResponse_1 = __importDefault(require("./app/utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const router_1 = __importDefault(require("./app/routes/router"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const env_1 = __importDefault(require("./app/config/env"));
const appError_1 = require("./app/errorHelpers/appError");
const app = (0, express_1.default)();
const allowedOrigins = [
    env_1.default.FRONTEND_URL_LOCAL,
    env_1.default.FRONTEND_URL_PRODUCTION,
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new appError_1.AppError(401, 'Now Allowed Origin'));
        }
    },
    credentials: true,
};
// middlewares==>
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
// router==>
app.use('/api/v1', router_1.default);
// base route==>
app.get('/', (req, res) => {
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'The playground server is running',
    });
});
// global error handler==>
app.use(globalErrorHandler_1.default);
// not found==>
app.use(notFound_1.default);
exports.default = app;
