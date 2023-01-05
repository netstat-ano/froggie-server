import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import bcryptjs from "bcryptjs";
import ResponseError from "../interfaces/ResponseError";
import { validationResult } from "express-validator/src/validation-result";
import jsonwebtoken from "jsonwebtoken";
import secretKey from "../utils/secret";
import sequelize from "../utils/database";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import errorsArrayToString from "../utils/errorsArrayToString";
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
            type: "admin",
        });
        res.status(201).json({
            message: "User created succesfully.",
            ok: true,
        });
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
        let expiresTime = "1h";
        if (req.body.dontLogout) {
            expiresTime = "3650d";
        }
        var token = jsonwebtoken.sign(
            {
                email: loadedUser.email,
                id: loadedUser.id,
                type: loadedUser.type,
            },
            secretKey,
            { expiresIn: expiresTime }
        );

        res.status(200).json({
            token: token,
            userId: loadedUser.id,
            type: loadedUser.type,
            ok: true,
        });
    } catch (err) {
        next(err);
    }
};
const postFetchUserDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const [fetchedUser] = await sequelize.query(
        "SELECT username FROM users WHERE id = :UserId",
        {
            replacements: {
                UserId: req.body.UserId,
            },
        }
    );
    if (fetchedUser.length === 0) {
        res.status(404).json({ message: `User doesn't exist.`, ok: false });
        return;
    } else {
        res.status(200).json({ user: fetchedUser[0] });
        return;
    }
};
const postChangePassword = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const valResult = validationResult(req);
    if (!valResult.isEmpty()) {
        const errors = errorsArrayToString(valResult.array());
        res.status(422).json({ message: errors, ok: false });
        return;
    }
    const user = await User.findOne({
        where: {
            id: req.userId,
        },
    });
    if (!user) {
        res.status(422).json({ message: `User doesn't exist`, ok: false });
        return;
    }
    const isEqual = bcryptjs.compare(req.body.oldPassword, user.password);
    if (!isEqual) {
        res.status(422).json({ message: "Bad data", ok: false });
        return;
    }
    user.password = await bcryptjs.hash(req.body.newPassword, 12);
    user.save();
    res.status(200).json({ message: "User password updated!", ok: true });
    return;
};
const authController = {
    postCreateUser,
    postLoginUser,
    postFetchUserDetails,
    postChangePassword,
};
export default authController;
