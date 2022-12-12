import { NextFunction, Request, Response } from "express";
import jws from "jsonwebtoken";
import User from "../models/User";
import ResponseError from "../interfaces/ResponseError";
import secretKey from "../utils/secret";
import UserJwtPayload from "../interfaces/UserJwtPayload";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
const isAdminAuth = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.get("Authorization")?.split(" ")[1];

    if (token) {
        try {
            var decodedToken = jws.verify(token, secretKey) as UserJwtPayload;
        } catch (err) {
            throw err;
        }
        if (!decodedToken) {
            const error: ResponseError = new Error("Not authenticated");
            error.status = 401;
            next(error);
        }
        if (decodedToken.type === "admin") {
            const currentUser = await User.findByPk(decodedToken.id);
            req.user = currentUser!;
            req.userId = decodedToken.id;
            req.token = token;
            req.type = decodedToken.type;
            next();
        } else {
            const error: ResponseError = new Error("Unauthorized");
            error.status = 401;
            next(error);
        }
    }
};
export default isAdminAuth;
