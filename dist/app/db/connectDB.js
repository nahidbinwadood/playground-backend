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
exports.getDBStatus = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = (DB_URL) => __awaiter(void 0, void 0, void 0, function* () {
    // already connected inside this container
    if (mongoose_1.default.connection.readyState === 1) {
        return;
    }
    if (!globalThis.__mongooseConnectPromise) {
        console.info('🔄 Database connection initiated...');
        globalThis.__mongooseConnectPromise = mongoose_1.default.connect(DB_URL);
    }
    try {
        yield globalThis.__mongooseConnectPromise;
        console.info('✅ Database connection established successfully');
    }
    catch (error) {
        // clear the rejected promise so the next request retries instead of
        // re-awaiting the same failure forever
        globalThis.__mongooseConnectPromise = undefined;
        console.error('❌ Database connection failed');
        console.error(error);
        // Never process.exit() here: this runs inside a serverless invocation, and
        // exiting kills the response before the caller can report what went wrong.
        // checkDBConnection turns this throw into a 503 and the next request retries.
        throw error;
    }
});
exports.connectDB = connectDB;
const getDBStatus = () => {
    // Check actual mongoose connection state
    return mongoose_1.default.connection.readyState === 1;
};
exports.getDBStatus = getDBStatus;
