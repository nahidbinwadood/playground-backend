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
    try {
        console.info('🔄 Database connection initiated...');
        yield mongoose_1.default.connect(DB_URL);
        console.info('✅ Database connection established successfully');
    }
    catch (error) {
        console.error('❌ Failed to start the server');
        console.error(error);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
const getDBStatus = () => {
    // Check actual mongoose connection state
    return mongoose_1.default.connection.readyState === 1;
};
exports.getDBStatus = getDBStatus;
