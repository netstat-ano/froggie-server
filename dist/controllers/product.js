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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../utils/database"));
const Product_1 = __importDefault(require("../models/Product"));
const postCreateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files) {
        const paths = [];
        const files = req.files;
        for (const img of files) {
            paths.push(img.path);
        }
        console.log(req.body);
        database_1.default.query(`INSERT INTO products(name, description, imagesURL, price, CategoryId, UserId)
            VALUES(:name, :description, :imagesURL, :price, :CategoryId, :UserId);`, {
            replacements: {
                name: req.body.productName,
                description: req.body.description,
                imagesURL: JSON.stringify(paths),
                CategoryId: req.body.categoryId,
                UserId: req.userId,
                price: req.body.price,
            },
            type: sequelize_1.QueryTypes.INSERT,
        });
    }
    else {
        const err = new Error("Files are required");
        err.status = 422;
        throw err;
    }
});
const postFetchProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield Product_1.default.findAll();
    if (!products) {
    }
});
const postFetchProductByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const [product, meta] = yield database_1.default.query("SELECT * FROM products WHERE CategoryId = :CategoryId", {
        replacements: {
            CategoryId: req.body.categoryId,
        },
    });
    if (product.length > 0) {
        res.status(200).json(product);
    }
    else {
        res.status(404).json({ message: "Products not found", ok: false });
    }
});
const postFetchProductByPk = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield Product_1.default.findByPk(req.body.id);
    if (!product) {
        res.status(404).json({
            message: "This product doesn't exist.",
            ok: false,
        });
    }
    else {
        res.status(200).json({ product, ok: true });
    }
});
const productController = {
    postCreateProduct,
    postFetchProducts,
    postFetchProductByCategory,
    postFetchProductByPk,
};
exports.default = productController;
