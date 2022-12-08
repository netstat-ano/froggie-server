import { NextFunction, Request, Response } from "express";
import jws from "jsonwebtoken";
import ResponseError from "../interfaces/ResponseError";
import secretKey from "../utils/secret";
import UserJwtPayload from "../interfaces/UserJwtPayload";
import User from "../models/User";
const isAuth = (req: Request, res: Response, next: NextFunction) => {
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
            throw error;
        }
        const loggedUser = User.findByPk(decodedToken.userId);
        req.body.decodedToken.userId = decodedToken.userId;
        req.body.decodedToken.token = decodedToken.token;
        req.body.decodedToken.type = decodedToken.type;
        next();
    }
};
export default isAuth;
