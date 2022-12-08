"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret_1 = __importDefault(require("../utils/secret"));
const isAdminAuth = (req, res, next) => {
    var _a;
    const token = (_a = req.get("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (token) {
        try {
            var decodedToken = jsonwebtoken_1.default.verify(token, secret_1.default);
        }
        catch (err) {
            throw err;
        }
        if (!decodedToken) {
            const error = new Error("Not authenticated");
            error.status = 401;
            throw error;
        }
        if (decodedToken.type === "admin") {
            req.userId = decodedToken.userId;
            req.token = token;
            req.type = decodedToken.type;
        }
    }
    next();
};
exports.default = isAdminAuth;
