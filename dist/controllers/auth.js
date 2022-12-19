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
const validation_result_1 = require("express-validator/src/validation-result");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret_1 = __importDefault(require("../utils/secret"));
const postCreateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password, retypePassword } = req.body;
        const result = (0, validation_result_1.validationResult)(req);
        if (!result.isEmpty()) {
            const errorsArray = result.array();
            let errors = "";
            for (const index in errorsArray) {
                errors += errorsArray[index].msg + " ";
            }
            let error = new Error(errors);
            error.status = 422;
            next(error);
            return;
        }
        if (retypePassword !== password) {
            let error = new Error("Passwords must match.");
            error.status = 422;
            next(error);
            return;
        }
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
            type: "admin",
        });
        res.status(201).json({
            message: "User created succesfully.",
            ok: true,
        });
    }
    catch (err) {
        next(err);
    }
});
const postLoginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const result = (0, validation_result_1.validationResult)(req);
        if (!result.isEmpty()) {
            const errorsArray = result.array();
            let errors = "";
            for (const index in errorsArray) {
                errors += errorsArray[index].msg + " ";
            }
            let error = new Error(errors);
            error.status = 422;
            next(error);
            return;
        }
        const loadedUser = yield User_1.default.findOne({
            where: {
                email: email,
            },
        });
        if (!loadedUser) {
            let error = new Error("Invalid email or password.");
            error.status = 401;
            next(error);
            return;
        }
        const isEqual = yield bcryptjs_1.default.compare(password, loadedUser.password);
        if (!isEqual) {
            let error = new Error("Invalid email or password.");
            error.status = 401;
            next(error);
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            email: loadedUser.email,
            id: loadedUser.id,
            type: loadedUser.type,
        }, secret_1.default, { expiresIn: "1h" });
        res.status(200).json({
            token: token,
            userId: loadedUser.id,
            type: loadedUser.type,
            ok: true,
        });
    }
    catch (err) {
        next(err);
    }
});
const authController = { postCreateUser, postLoginUser };
exports.default = authController;
