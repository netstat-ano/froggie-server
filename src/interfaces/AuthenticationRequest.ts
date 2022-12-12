import { Request } from "express";
import User from "../models/User";
interface AuthenticationRequest extends Request {
    userId?: string;
    type?: string;
    token?: string;
    user?: User;
}
export default AuthenticationRequest;
