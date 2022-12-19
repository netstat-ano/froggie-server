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
const Category_1 = __importDefault(require("../models/Category"));
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../utils/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const postAddCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new Error("Empty name field");
        error.status = 422;
        throw error;
    }
    try {
        const addedCategory = yield Category_1.default.create({
            name: req.body.name,
        });
        res.status(201).json({ category: addedCategory });
    }
    catch (err) {
        next(err);
    }
});
const postFetchCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Category_1.default.findAll({ attributes: ["id", "name"] });
        res.status(200).json({ categories: response });
    }
    catch (err) {
        next(err);
    }
});
const postDeleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const findedCategory = yield Category_1.default.findByPk(req.body.id);
        if (findedCategory) {
            const [products, meta] = yield database_1.default.query("SELECT * FROM products WHERE CategoryId = :categoryId", { replacements: { categoryId: findedCategory.id } });
            for (const product of products) {
                for (const url of product.imagesURL) {
                    fs_1.default.unlink(path_1.default.join(__dirname, "..", "..", url), (err) => {
                        if (err) {
                            next(err);
                        }
                    });
                }
            }
            yield findedCategory.destroy();
            res.status(200).json({ message: "Category has been deleted" });
        }
        else {
            const error = new Error("Cannot find category with this id.");
            throw error;
        }
    }
    catch (err) {
        next(err);
    }
});
exports.default = { postAddCategory, postFetchCategories, postDeleteCategory };
