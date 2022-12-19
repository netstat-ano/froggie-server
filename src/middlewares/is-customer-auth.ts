import { NextFunction, Response } from "express";
import jws from "jsonwebtoken";
import ResponseError from "../interfaces/ResponseError";
import secretKey from "../utils/secret";
import UserJwtPayload from "../interfaces/UserJwtPayload";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
const isCustomerAuth = (
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
        if (decodedToken.type === "customer") {
            req.body.decodedToken.userId = decodedToken.id;
            req.body.decodedToken.token = decodedToken.token;
            req.body.decodedToken.type = decodedToken.type;
            next();
        }
    }
};
export default isCustomerAuth;
