"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = __importDefault(require("../controllers/product"));
const is_admin_auth_1 = __importDefault(require("../middlewares/is-admin-auth"));
const productRoutes = express_1.default.Router();
productRoutes.post("/create-product", is_admin_auth_1.default, product_1.default.postCreateProduct);
productRoutes.post("/fetch-products", product_1.default.postFetchProducts);
productRoutes.post("/fetch-product-by-category", product_1.default.postFetchProductByCategory);
productRoutes.post("/fetch-product-by-pk", product_1.default.postFetchProductByPk);
exports.default = productRoutes;
