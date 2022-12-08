"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../controllers/auth"));
const check_1 = require("express-validator/check");
const authRoutes = express_1.default.Router();
authRoutes.post("/create-user", [
    (0, check_1.body)("email").isEmail().withMessage("Invalid e-mail format."),
    (0, check_1.body)("username")
        .isLength({ min: 4 })
        .withMessage("Username must contains min 4 character."),
    (0, check_1.body)("password")
        .isLength({ min: 8 })
        .withMessage("Password must contains min 8 characters."),
], auth_1.default.postCreateUser);
authRoutes.post("/login-user", [
    (0, check_1.body)("email").isEmail().withMessage("Invalid e-mail format."),
    (0, check_1.body)("password")
        .isLength({ min: 8 })
        .withMessage("Password must contains min 8 characters."),
], auth_1.default.postLoginUser);
exports.default = authRoutes;
