import { Request } from "express";
import User from "../models/User";
interface AuthenticationRequest extends Request {
    userId?: string;
    type?: string;
    token?: string;
}
export default AuthenticationRequest;
