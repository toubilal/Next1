"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatProductImage = void 0;
// utils/productUtils.ts
var index_1 = require("@/components/constants/index");
var formatProductImage = function (product) {
    // نقوم بإضافة الرابط الكامل فقط إذا لم يكن موجوداً
    return __assign(__assign({}, product), { Image: product.Image && !product.Image.startsWith('http')
            ? "".concat(index_1.SUPABASE_STORAGE_URL).concat(product.Image)
            : product.Image });
};
exports.formatProductImage = formatProductImage;
