"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blog = void 0;
const mongoose_1 = require("mongoose");
const generateSlug_1 = require("../../utils/generateSlug");
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
const blogSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    excerpt: {
        type: String,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: schemaTransform,
    toObject: schemaTransform,
});
blogSchema.pre('save', function () {
    if (this.isModified('title')) {
        this.slug = (0, generateSlug_1.generateSlug)(this.title);
    }
});
exports.Blog = (0, mongoose_1.model)('Blog', blogSchema);
