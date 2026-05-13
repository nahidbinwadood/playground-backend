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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = __importDefault(require("./app/config/env"));
let server;
const PORT = env_1.default.PORT;
const DB_URL = env_1.default.DB_URL;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to DB in background (non-blocking) to speed up restarts
        console.info('🔄 Database connection initiated...');
        mongoose_1.default.connect(DB_URL)
            .then(() => console.info('✅ Database connection established successfully'))
            .catch((err) => {
            console.error('❌ Database connection failed');
            console.error(err);
        });
        server = app_1.default.listen(PORT, () => {
            console.info(`🚀 Server started successfully`);
            console.info(`📡 Listening on port: ${PORT}`);
            console.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start the server');
        console.error(error);
        process.exit(1);
    }
});
startServer();
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received...Server is shutting down');
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('SIGINT', () => {
    console.log('SIGINT signal received...Server is shutting down');
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// unhandled error==>
process.on('unhandledRejection', (error) => {
    console.log('Unhandled error occured', error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// uncaught execption ==>
process.on('uncaughtException', (error) => {
    console.log('Uncaught exception occured', error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
