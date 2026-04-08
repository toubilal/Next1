'use server';
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductPriceAction = exports.getProductsAction = exports.createFolder1 = exports.deleteImageFile = exports.getProducts = exports.uploadImageAction = void 0;
var buffer_1 = require("buffer");
var promises_1 = require("fs/promises");
var fs_1 = require("fs");
var path_1 = require("path");
function uploadImageAction(formData) {
    return __awaiter(this, void 0, void 0, function () {
        var file, bytes, buffer, relativePath, fullPath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    file = formData.get('image');
                    if (!file)
                        throw new Error("لم يتم اختيار صورة");
                    return [4 /*yield*/, file.arrayBuffer()];
                case 1:
                    bytes = _a.sent();
                    buffer = buffer_1.Buffer.from(bytes);
                    relativePath = formData.get('path');
                    fullPath = path_1.default.join(process.cwd(), 'public', relativePath);
                    // التأكد من وجود المجلد
                    return [4 /*yield*/, (0, promises_1.mkdir)(path_1.default.dirname(fullPath), { recursive: true })];
                case 2:
                    // التأكد من وجود المجلد
                    _a.sent();
                    // كتابة الملف بانتظار (await) لضمان اكتمال العملية
                    return [4 /*yield*/, (0, promises_1.writeFile)(fullPath, buffer)];
                case 3:
                    // كتابة الملف بانتظار (await) لضمان اكتمال العملية
                    _a.sent();
                    return [2 /*return*/, { success: true, url: relativePath }];
                case 4:
                    error_1 = _a.sent();
                    return [2 /*return*/, { success: false, message: "حدث خطأ أثناء الرفع" }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.uploadImageAction = uploadImageAction;
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
function getProducts() {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileContent, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    filePath = path_1.default.join(process.cwd(), 'my-store-data', 'data.json');
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf-8')];
                case 1:
                    fileContent = _a.sent();
                    // إذا كان الملف فارغاً تماماً، نرجع مصفوفة فارغة
                    if (!fileContent.trim()) {
                        return [2 /*return*/, []];
                    }
                    // تحويل النص إلى مصفوفة حقيقية
                    return [2 /*return*/, JSON.parse(fileContent)];
                case 2:
                    error_2 = _a.sent();
                    // في حال عدم وجود الملف أو حدوث خطأ في القراءة
                    console.error("خطأ في قراءة الملف:", error_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getProducts = getProducts;
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
function deleteImageFile(imagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var cleanPath, fullPath;
        return __generator(this, function (_a) {
            cleanPath = imagePath.startsWith('/')
                ? imagePath.slice(1)
                : imagePath;
            fullPath = path_1.default.join(process.cwd(), 'public', cleanPath);
            console.log('PATH:', fullPath);
            if (fs_1.default.existsSync(fullPath)) {
                fs_1.default.unlinkSync(fullPath);
            }
            return [2 /*return*/];
        });
    });
}
exports.deleteImageFile = deleteImageFile;
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
function createFolder1(name, price) {
    return __awaiter(this, void 0, void 0, function () {
        var folderPath, filePath, existingData, fileContent, e_1, newProduct, updatedData, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    folderPath = path_1.default.join(process.cwd(), 'my-store-data');
                    filePath = path_1.default.join(folderPath, 'data.json');
                    // التأكد من وجود المجلد أولاً
                    return [4 /*yield*/, (0, promises_1.mkdir)(folderPath, { recursive: true })];
                case 1:
                    // التأكد من وجود المجلد أولاً
                    _a.sent();
                    existingData = [];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf-8')];
                case 3:
                    fileContent = _a.sent();
                    existingData = JSON.parse(fileContent); // تحويل النص لمصفوفة
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5:
                    newProduct = {
                        id: Date.now(),
                        name: name,
                        price: price,
                        date: new Date().toISOString()
                    };
                    updatedData = __spreadArray(__spreadArray([], existingData, true), [newProduct], false);
                    // 4. حفظ الكل في الملف
                    return [4 /*yield*/, (0, promises_1.writeFile)(filePath, JSON.stringify(updatedData, null, 2))];
                case 6:
                    // 4. حفظ الكل في الملف
                    _a.sent();
                    return [2 /*return*/, { success: true, message: "تمت إضافة المنتج بنجاح! ✅" }];
                case 7:
                    error_3 = _a.sent();
                    return [2 /*return*/, { success: false, message: "فشل في حفظ البيانات" }];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.createFolder1 = createFolder1;
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
// جلب كل المنتجات
function getProductsAction() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabaseAdmin
                        .from('Products')
                        .select('*')
                        .order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        return [2 /*return*/, { success: false, error: error.message }];
                    return [2 /*return*/, { success: true, data: data }];
            }
        });
    });
}
exports.getProductsAction = getProductsAction;
// تحديث سعر منتج
function updateProductPriceAction(id, newPrice) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabaseAdmin
                        .from('Products')
                        .update({ Price: newPrice })
                        .eq('id', id)];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        return [2 /*return*/, { success: false, error: error.message }];
                    return [2 /*return*/, { success: true }];
            }
        });
    });
}
exports.updateProductPriceAction = updateProductPriceAction;
