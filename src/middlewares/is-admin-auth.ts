import { NextFunction, Request, Response } from "express";
import jws from "jsonwebtoken";
import ResponseError from "../interfaces/ResponseError";
import secretKey from "../utils/secret";
import UserJwtPayload from "../interfaces/UserJwtPayload";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
const isAdminAuth = (
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
            throw error;
        }
        if (decodedToken.type === "admin") {
            req.userId = decodedToken.id;
            req.token = token;
            req.type = decodedToken.type;
        }
    }
    next();
};
export default isAdminAuth;
