import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import bcryptjs from "bcryptjs";
import ResponseError from "../interfaces/ResponseError";
import { validationResult } from "express-validator/src/validation-result";
import jsonwebtoken from "jsonwebtoken";
import secretKey from "../utils/secret";
const postCreateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, username, password, retypePassword } = req.body;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const errorsArray = result.array();
            let errors = "";
            for (const index in errorsArray) {
                errors += errorsArray[index].msg + " ";
            }
            let error: ResponseError = new Error(errors);
            error.status = 422;
            next(error);
            return;
        }
        if (retypePassword !== password) {
            let error: ResponseError = new Error("Passwords must match.");
            error.status = 422;
            next(error);
            return;
        }
        const isEmailExist = await User.findOne({ where: { email: email } });
        if (isEmailExist) {
            let error: ResponseError = new Error("This email exists.");
            error.status = 422;
            next(error);
            return;
        }
        const hashedPassword = await bcryptjs.hash(password, 12);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            type: "customer",
        });
        res.status(201).json({ message: "User created succesfully." });
    } catch (err) {
        next(err);
    }
};
const postLoginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const errorsArray = result.array();
            let errors = "";
            for (const index in errorsArray) {
                errors += errorsArray[index].msg + " ";
            }
            let error: ResponseError = new Error(errors);
            error.status = 422;
            next(error);
            return;
        }
        const loadedUser = await User.findOne({
            where: {
                email: email,
            },
        });
        if (!loadedUser) {
            let error: ResponseError = new Error("Invalid email or password.");
            error.status = 401;
            next(error);
            return;
        }
        const isEqual = await bcryptjs.compare(password, loadedUser.password);
        if (!isEqual) {
            let error: ResponseError = new Error("Invalid email or password.");
            error.status = 401;
            next(error);
            return;
        }
        const token = jsonwebtoken.sign(
            {
                email: loadedUser.email,
                id: loadedUser.id,
            },
            secretKey,
            { expiresIn: "1h" }
        );
        res.status(200).json({
            token: token,
            userId: loadedUser.id,
            userType: loadedUser.type,
        });
    } catch (err) {
        next(err);
    }
};
const authController = { postCreateUser, postLoginUser };
export default authController;
