"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = void 0;
const generateSlug = (title) => {
    return title
        .normalize('NFD') // decompose accented chars (é → e + ́)
        .replace(/[\u0300-\u036f]/g, '') // strip accent/diacritic marks
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove anything that's not alphanumeric, space, or hyphen
        .replace(/[\s]+/g, '-') // replace whitespace (including multiple spaces) with a single hyphen
        .replace(/-+/g, '-') // collapse consecutive hyphens into one
        .replace(/^-+|-+$/g, ''); // strip leading/trailing hyphens
};
exports.generateSlug = generateSlug;
