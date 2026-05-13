"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = void 0;
const generateSlug = (title) => {
    return title
        .split(' ')
        .map((item) => item.toLocaleLowerCase())
        .join('-');
};
exports.generateSlug = generateSlug;
