"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const is_auth_1 = __importDefault(require("../middlewares/is-auth"));
const cart_1 = __importDefault(require("../controllers/cart"));
const cartRoutes = express_1.default.Router();
cartRoutes.post("/add-product", is_auth_1.default, cart_1.default.postAddProduct);
exports.default = cartRoutes;
