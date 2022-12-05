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
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const postCreateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password, retypePassword } = req.body;
        const isEmailExist = yield User_1.default.findOne({ where: { email: email } });
        if (isEmailExist) {
            let error = new Error("This email exists.");
            error.status = 422;
            next(error);
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const user = yield User_1.default.create({
            username,
            email,
            password: hashedPassword,
        });
        res.status(201).json({ message: "User created succesfully." });
    }
    catch (err) {
        next(err);
    }
});
const postLoginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { });
const authController = { postCreateUser, postLoginUser };
exports.default = authController;
