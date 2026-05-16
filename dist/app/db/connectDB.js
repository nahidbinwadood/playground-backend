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
exports.setDBStatus = exports.getDBStatus = exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../errorHelpers/appError");
let isDBConnected = false;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const connectDB = (dbUrl) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Check if already connected
    if (isDBConnected && mongoose_1.default.connection.readyState === 1) {
        console.info('✅ Already connected to database');
        return;
    }
    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.info(`🔄 Database connection attempt ${attempt}/${MAX_RETRIES}...`);
            // Log connection URL (masked for security)
            const urlDomain = ((_a = dbUrl.match(/@([^/]+)/)) === null || _a === void 0 ? void 0 : _a[1]) || 'unknown';
            console.info(`📍 Connecting to cluster: ${urlDomain}`);
            yield mongoose_1.default.connect(dbUrl, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 30000,
                retryWrites: true,
                maxPoolSize: 10,
            });
            isDBConnected = true;
            console.info('✅ Database connection established successfully');
            return;
        }
        catch (error) {
            lastError = error;
            console.error(`❌ Connection attempt ${attempt} failed: ${error.message}`);
            if (attempt < MAX_RETRIES) {
                console.info(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
                yield sleep(RETRY_DELAY);
            }
        }
    }
    isDBConnected = false;
    console.error('❌ Failed to connect to database after all retries');
    console.error(`Error: ${lastError === null || lastError === void 0 ? void 0 : lastError.message}`);
    console.error(`Error Code: ${lastError === null || lastError === void 0 ? void 0 : lastError.code}`);
    // Throw so the caller can log and handle appropriately
    throw new appError_1.AppError(500, `Database connection failed: ${(_b = lastError === null || lastError === void 0 ? void 0 : lastError.message) !== null && _b !== void 0 ? _b : 'Unknown error'}`);
});
exports.connectDB = connectDB;
const disconnectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.disconnect();
        isDBConnected = false;
        console.info('✅ Database disconnected successfully');
    }
    catch (error) {
        console.error('❌ Failed to disconnect from database');
        console.error(error);
        throw error;
    }
});
exports.disconnectDB = disconnectDB;
const getDBStatus = () => {
    // Check actual mongoose connection state
    return mongoose_1.default.connection.readyState === 1;
};
exports.getDBStatus = getDBStatus;
const setDBStatus = (status) => {
    isDBConnected = status;
};
exports.setDBStatus = setDBStatus;
// Handle Atlas dropping idle connections (common on M0 free tier)
mongoose_1.default.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Will reconnect on next request.');
    isDBConnected = false;
});
mongoose_1.default.connection.on('reconnected', () => {
    console.info('✅ MongoDB reconnected successfully');
    isDBConnected = true;
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    isDBConnected = false;
});
