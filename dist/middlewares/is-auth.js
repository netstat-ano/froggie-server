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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret_1 = __importDefault(require("../utils/secret"));
const User_1 = __importDefault(require("../models/User"));
const isAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const currentUser = yield User_1.default.findByPk(decodedToken.id);
        req.user = currentUser;
        req.userId = decodedToken.id;
        req.token = decodedToken.token;
        req.type = decodedToken.type;
        next();
    }
});
exports.default = isAuth;
