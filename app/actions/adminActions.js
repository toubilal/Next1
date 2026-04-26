'use server'; // هذا السطر يحول كل الدوال في الملف إلى Server Actions
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageAction = exports.updateProductStatus = exports.getAdminProductById = exports.getFullCategoryProducts = exports.getAllProductsForAdmin = exports.deleteOrder = exports.deleteProductAction = exports.deleteId_order = exports.updateProductAction = exports.addProductAction = exports.getWeeklyStats = exports.Stats = exports.getRecentOrders = exports.handleConfirmOrder = exports.update_quantity_rpc = void 0;
var auth_1 = require("@/lib/auth");
var supabase_js_1 = require("@supabase/supabase-js"); // يفضل استخدام نسخة السيرفر هنا
var index_1 = require("@/components/constants/index");
// إعداد عميل السوبابيس للسيرفر (باستخدام مفتاح الخدمة أو اليوزر)
function adminAction(callback) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, auth_1.requireAdmin)()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, callback()];
            }
        });
    });
}
var supabaseAdmin = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY // هذا سيقرأ القيمة 'sb_secret_...' من ملفك
);
//تعديل كمية الطلب
// --- الجزء الأول ---
// دالة تحديث الكمية
function update_quantity_rpc(Id, newQuantity) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var error;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, supabaseAdmin.rpc('update_order_quantity', {
                                    row_id: Id,
                                    new_qty: newQuantity
                                })];
                            case 1:
                                error = (_a.sent()).error;
                                if (error) {
                                    console.error("RPC Error:", error.message);
                                    return [2 /*return*/, { error: error }];
                                }
                                return [2 /*return*/, { success: true }];
                        }
                    });
                }); })];
        });
    });
}
exports.update_quantity_rpc = update_quantity_rpc;
// دالة تأكيد الطلب
function handleConfirmOrder(orderId, newStat, itemsToUpdate) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var error;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, supabaseAdmin.rpc('update_order_full', {
                                    order_id_input: orderId,
                                    status_input: newStat,
                                    items_input: itemsToUpdate
                                })];
                            case 1:
                                error = (_a.sent()).error;
                                if (error)
                                    return [2 /*return*/, { error: error.message }];
                                return [2 /*return*/, { success: true }];
                        }
                    });
                }); })];
        });
    });
}
exports.handleConfirmOrder = handleConfirmOrder;
// دالة جلب الطلبات الأخيرة
function getRecentOrders() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, data, error, enrichedData;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, supabaseAdmin
                                    .from('orders')
                                    .select("\n        id, status, order_id, created_at, product_id, quantity, selectedOptions,\n        customer_name, customer_phone, customer_address,\n        product:sys_data_node_77 (\n          Title, Image, Price, quantity_all:quantity, extra_payload\n        )\n      ")
                                    .order('created_at', { ascending: false })];
                            case 1:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                if (error)
                                    return [2 /*return*/, { data: data, error: error }];
                                enrichedData = data.map(function (order) {
                                    var _a, _b;
                                    var product = order.product;
                                    var matchedPrice = (_a = product === null || product === void 0 ? void 0 : product.price) !== null && _a !== void 0 ? _a : 0;
                                    var matchedStock = (_b = product === null || product === void 0 ? void 0 : product.quantity_all) !== null && _b !== void 0 ? _b : 0;
                                    var selected = order.selectedOptions;
                                    var variants = product === null || product === void 0 ? void 0 : product.extra_payload;
                                    if (selected && typeof selected === "object" && Object.keys(selected).length > 0 && Array.isArray(variants)) {
                                        var match = variants.find(function (v) {
                                            var options = v.options || {};
                                            return Object.keys(selected).every(function (key) { return selected[key] === options[key]; });
                                        });
                                        if (match) {
                                            matchedPrice = match.price;
                                            matchedStock = match.stock;
                                        }
                                    }
                                    return __assign(__assign({}, order), { product: __assign(__assign({}, product), { Price: matchedPrice, quantity_all: matchedStock, Image: product.Image ? "".concat(index_1.SUPABASE_STORAGE_URL).concat(product.Image) : null }) });
                                });
                                return [2 /*return*/, { data: enrichedData, error: error }];
                        }
                    });
                }); })];
        });
    });
}
exports.getRecentOrders = getRecentOrders;
// دالة جلب الإحصائيات العامة
function Stats() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, data, error, dataWithConversion;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, supabaseAdmin
                                    .from('sys_data_node_77')
                                    .select('id, Title, Image, views, orders, likes_count')
                                    .order('views', { ascending: false })];
                            case 1:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                if (error)
                                    return [2 /*return*/, { data: data, error: error }];
                                dataWithConversion = data.map(function (item) { return (__assign(__assign({}, item), { Image: item.Image ? "".concat(index_1.SUPABASE_STORAGE_URL).concat(item.Image) : null, conversion: item.views > 0
                                        ? ((item.orders || 0) / item.views * 100).toFixed(1)
                                        : "0.0" })); });
                                return [2 /*return*/, { data: dataWithConversion, error: error }];
                        }
                    });
                }); })];
        });
    });
}
exports.Stats = Stats;
// دالة جلب مشاهدات الأسبوع الأخير
function getWeeklyStats() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var sevenDaysAgo, startDate, _a, data, error, last7Days_1, i, d, dateKey, chartData, error_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                sevenDaysAgo = new Date();
                                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                                startDate = sevenDaysAgo.toISOString();
                                return [4 /*yield*/, supabaseAdmin
                                        .from('product_views')
                                        .select('created_at')
                                        .gte('created_at', startDate)
                                        .order('created_at', { ascending: true })];
                            case 1:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                if (error)
                                    throw error;
                                last7Days_1 = {};
                                for (i = 6; i >= 0; i--) {
                                    d = new Date();
                                    d.setDate(d.getDate() - i);
                                    dateKey = d.toISOString().split('T')[0];
                                    last7Days_1[dateKey] = 0;
                                }
                                data === null || data === void 0 ? void 0 : data.forEach(function (view) {
                                    var dateKey = view.created_at.split('T')[0];
                                    if (last7Days_1[dateKey] !== undefined) {
                                        last7Days_1[dateKey]++;
                                    }
                                });
                                chartData = Object.entries(last7Days_1).map(function (_a) {
                                    var date = _a[0], count = _a[1];
                                    return ({
                                        day: date.split('-').reverse().slice(0, 2).join('/'),
                                        views: count,
                                    });
                                });
                                return [2 /*return*/, { data: chartData, error: null }];
                            case 2:
                                error_1 = _b.sent();
                                console.error("Error in getWeeklyStats:", error_1);
                                return [2 /*return*/, { data: [], error: error_1.message }];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.getWeeklyStats = getWeeklyStats;
// دالة إضافة منتج
function addProductAction(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, data, error;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, supabaseAdmin
                                    .from('sys_data_node_77')
                                    .insert([{
                                        "Title": payload.Title,
                                        "Price": payload.Price,
                                        "Image": payload.Image,
                                        category: payload.category,
                                        quantity: payload.quantity,
                                        field_desc: payload.field_desc,
                                        extra_payload: payload.options,
                                        prev_price: payload.old_price,
                                        qty_level: payload.stock_quantity,
                                        status: 'active'
                                    }])
                                    .select()];
                            case 1:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                return [2 /*return*/, { error: error === null || error === void 0 ? void 0 : error.message, data: data }];
                        }
                    });
                }); })];
        });
    });
}
exports.addProductAction = addProductAction;
// 2. تحديث منتج مع استبدال الصورة (حذف القديمة ووضع الجديدة)
// --- الجزء الثاني ---
// تحديث منتج
function updateProductAction(id, payload, oldImageName) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var storageError, _a, data, error;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!(payload.Image && oldImageName && payload.Image !== oldImageName)) return [3 /*break*/, 2];
                                return [4 /*yield*/, supabaseAdmin.storage
                                        .from('products')
                                        .remove([oldImageName])];
                            case 1:
                                storageError = (_b.sent()).error;
                                if (storageError) {
                                    console.error("خطأ أثناء حذف الصورة القديمة:", storageError.message);
                                }
                                _b.label = 2;
                            case 2: return [4 /*yield*/, supabaseAdmin
                                    .from('sys_data_node_77')
                                    .update({
                                    "Title": payload.Title,
                                    "Price": payload.Price,
                                    "Image": payload.Image,
                                    field_desc: payload.Description,
                                    extra_payload: payload.options,
                                })
                                    .eq('id', id)
                                    .select()];
                            case 3:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                return [2 /*return*/, { error: error === null || error === void 0 ? void 0 : error.message, data: data }];
                        }
                    });
                }); })];
        });
    });
}
exports.updateProductAction = updateProductAction;
// حذف منتج من السلة
function deleteId_order(id) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var error;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, supabaseAdmin
                                    .from('orders')
                                    .delete()
                                    .eq('id', id)];
                            case 1:
                                error = (_a.sent()).error;
                                if (error) {
                                    return [2 /*return*/, { success: false, error: error.message }];
                                }
                                return [2 /*return*/, { success: true }];
                        }
                    });
                }); })];
        });
    });
}
exports.deleteId_order = deleteId_order;
// حذف منتج (بأفضل أداء: حذف مباشر بدون جلب)
function deleteProductAction(id, imageName) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var storageError, deleteError;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!imageName) return [3 /*break*/, 2];
                                return [4 /*yield*/, supabaseAdmin.storage
                                        .from('products')
                                        .remove([imageName])];
                            case 1:
                                storageError = (_a.sent()).error;
                                if (storageError) {
                                    console.error("خطأ أثناء حذف الصورة:", storageError.message);
                                }
                                _a.label = 2;
                            case 2: return [4 /*yield*/, supabaseAdmin
                                    .from('sys_data_node_77')
                                    .delete()
                                    .eq('id', id)];
                            case 3:
                                deleteError = (_a.sent()).error;
                                return [2 /*return*/, { error: deleteError === null || deleteError === void 0 ? void 0 : deleteError.message }];
                        }
                    });
                }); })];
        });
    });
}
exports.deleteProductAction = deleteProductAction;
// حذف السلة
function deleteOrder(orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, data, error, error_2;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, supabaseAdmin
                                        .from('orders')
                                        .delete()
                                        .eq('order_id', orderId)];
                            case 1:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                if (error)
                                    throw error;
                                console.log("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 ".concat(orderId, " \u0628\u0646\u062C\u0627\u062D"));
                                return [2 /*return*/, { success: true, data: data }];
                            case 2:
                                error_2 = _b.sent();
                                console.error('خطأ أثناء الحذف:', error_2.message);
                                return [2 /*return*/, { success: false, error: error_2.message }];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.deleteOrder = deleteOrder;
// جلب جميع المنتجات للوحة التحكم
function getAllProductsForAdmin() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, data, error;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, supabaseAdmin
                                    .from('sys_data_node_77')
                                    .select('*')
                                    .order('id', { ascending: false })];
                            case 1:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                if (error) {
                                    console.error("Admin Fetch Error:", error.message);
                                    return [2 /*return*/, { success: false, error: error.message }];
                                }
                                return [2 /*return*/, { success: true, data: data }];
                        }
                    });
                }); })];
        });
    });
}
exports.getAllProductsForAdmin = getAllProductsForAdmin;
// جلب جميع منتجات صنف معين باستثناء ID واحد (للأدمن)
function getFullCategoryProducts(categoryName, excludeId) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, data, error;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, supabaseAdmin
                                    .from('sys_data_node_77')
                                    .select('*')
                                    .eq('category', categoryName)
                                    .neq('id', excludeId)
                                    .order('id', { ascending: false })];
                            case 1:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                if (error) {
                                    console.error("Admin Full Category Fetch Error:", error.message);
                                    return [2 /*return*/, { success: false, error: error.message }];
                                }
                                return [2 /*return*/, { success: true, data: data }];
                        }
                    });
                }); })];
        });
    });
}
exports.getFullCategoryProducts = getFullCategoryProducts;
// جلب تفاصيل منتج واحد كاملة للأدمن
function getAdminProductById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, data, error;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, supabaseAdmin
                                    .from('sys_data_node_77')
                                    .select('*')
                                    .eq('id', id)
                                    .single()];
                            case 1:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                if (error) {
                                    console.error("Admin Fetch ID Error:", error.message);
                                    return [2 /*return*/, { success: false, error: error.message }];
                                }
                                return [2 /*return*/, { success: true, data: data }];
                        }
                    });
                }); })];
        });
    });
}
exports.getAdminProductById = getAdminProductById;
// تحديث حالة المنتج
function updateProductStatus(id, nextStatus) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var error, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, supabaseAdmin
                                        .from('sys_data_node_77')
                                        .update({ status: nextStatus })
                                        .eq('id', id)];
                            case 1:
                                error = (_a.sent()).error;
                                if (error) {
                                    return [2 /*return*/, { success: false, message: error.message }];
                                }
                                return [2 /*return*/, { success: true, message: "تم التحديث بنجاح" }];
                            case 2:
                                err_1 = _a.sent();
                                return [2 /*return*/, { success: false, message: "خطأ في السيرفر" }];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.updateProductStatus = updateProductStatus;
// رفع صورة
function uploadImageAction(formData) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, adminAction(function () { return __awaiter(_this, void 0, void 0, function () {
                    var file, fileName, _a, data, error;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                file = formData.get('image');
                                fileName = formData.get('path');
                                return [4 /*yield*/, supabaseAdmin.storage
                                        .from('products')
                                        .upload(fileName, file, {
                                        cacheControl: '3600',
                                        upsert: true,
                                    })];
                            case 1:
                                _a = _b.sent(), data = _a.data, error = _a.error;
                                if (error) {
                                    console.error("Supabase Storage Error:", error);
                                    return [2 /*return*/, { success: false, error: error.message }];
                                }
                                return [2 /*return*/, { success: true, path: data.path }];
                        }
                    });
                }); })];
        });
    });
}
exports.uploadImageAction = uploadImageAction;
