"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const schemaTransform = {
    virtuals: true,
    transform: (_, ret) => {
        ret.id = ret._id;
        const transformed = Object.assign({ id: ret._id }, ret);
        delete transformed._id;
        delete transformed._v;
        return transformed;
    },
};
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(user_interface_1.USER_ROLE),
    },
    isActive: {
        type: String,
        enum: Object.values(user_interface_1.IsActive),
        default: user_interface_1.IsActive.ACTIVE,
    },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: schemaTransform,
    toObject: schemaTransform,
});
exports.User = (0, mongoose_1.model)('User', userSchema);
