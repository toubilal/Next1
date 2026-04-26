"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatProductImage = void 0;
// utils/productUtils.ts
var index_1 = require("@/components/constants/index");
var formatProductImage = function (image) {
    if (!image)
        return null;
    var cleanImage = typeof image === "object"
        ? Object.values(image).join("")
        : image;
    return cleanImage.startsWith("http")
        ? cleanImage
        : "".concat(index_1.SUPABASE_STORAGE_URL).concat(cleanImage);
};
exports.formatProductImage = formatProductImage;
