"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const generateSlug_1 = require("../../utils/generateSlug");
const category_interface_1 = require("./category.interface");
// same _id → id transform as blog.model.ts and note.model.ts, so the frontend
// keeps receiving `id` instead of `_id`
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
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // unique: this is the handle the pickers and the public filter use, so two
    // categories sharing one would be ambiguous everywhere
    slug: {
        type: String,
        unique: true,
        trim: true,
    },
    tone: {
        type: String,
        enum: Object.values(category_interface_1.CATEGORY_TONES),
        default: 'iris',
    },
    description: {
        type: String,
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: schemaTransform,
    toObject: schemaTransform,
});
// Renaming regenerates the slug, exactly like a blog title does. Updates go
// through findOneAndUpdate (which skips this hook), so the service sets the slug
// itself on that path.
categorySchema.pre('save', function () {
    if (this.isModified('name')) {
        this.slug = (0, generateSlug_1.generateSlug)(this.name);
    }
});
exports.Category = (0, mongoose_1.model)('Category', categorySchema);
