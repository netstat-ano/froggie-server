"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_1 = __importDefault(require("../controllers/category"));
const check_1 = require("express-validator/check");
const is_admin_auth_1 = __importDefault(require("../middlewares/is-admin-auth"));
const categoryRoutes = express_1.default.Router();
categoryRoutes.post("/add-category", is_admin_auth_1.default, (0, check_1.body)("name").notEmpty(), category_1.default.postAddCategory);
categoryRoutes.delete("/delete-category", is_admin_auth_1.default, category_1.default.postDeleteCategory);
categoryRoutes.post("/fetch-categories", category_1.default.postFetchCategories);
exports.default = categoryRoutes;
