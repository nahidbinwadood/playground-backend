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
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const checkDBConnection_1 = __importDefault(require("./app/middlewares/checkDBConnection"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const router_1 = __importDefault(require("./app/routes/router"));
const sendResponse_1 = __importDefault(require("./app/utils/sendResponse"));
const connectDB_1 = require("./app/db/connectDB");
const server_1 = __importDefault(require("./server"));
const app = (0, express_1.default)();
// const allowedOrigins = [
//   envVars.FRONTEND_URL_LOCAL,
//   envVars.FRONTEND_URL_PRODUCTION,
// ].filter(Boolean) as string[];
// const corsOptions = {
//   origin: (origin: string | undefined, callback: any) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new AppError(401, 'Now Allowed Origin'));
//     }
//   },
//   credentials: true,
// };
// middlewares==>
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// router==>
app.use('/api/v1', checkDBConnection_1.default, router_1.default);
// base route==>
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connectDb = yield (0, connectDB_1.connectDB)(server_1.default.DB_URL);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'The playground server is running',
        data: connectDb,
    });
}));
// health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = (0, connectDB_1.getDBStatus)();
    (0, sendResponse_1.default)(res, {
        success: dbStatus,
        statusCode: dbStatus
            ? http_status_codes_1.default.OK
            : http_status_codes_1.default.SERVICE_UNAVAILABLE,
        message: dbStatus
            ? 'Server is healthy and database is connected'
            : 'Server is running but database connection failed',
        data: {
            server: 'running',
            database: dbStatus ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
        },
    });
});
// not found==>
app.use(notFound_1.default);
// global error handler==>
app.use(globalErrorHandler_1.default);
exports.default = app;
