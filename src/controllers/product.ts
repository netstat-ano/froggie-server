import { NextFunction, Request, Response } from "express";
import multer from "multer";
import Image from "../interfaces/Image";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import ResponseError from "../interfaces/ResponseError";
import User from "../models/User";
import Product from "../models/Product";
import Categorie from "../models/Category";

const createProduct = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.files) {
        const paths = [];
        const files = req.files as Image[];
        for (const img of files) {
            paths.push(img.path);
        }
    } else {
        const err: ResponseError = new Error("Files are required");
        err.status = 422;
        throw err;
    }
};
const productController = { createProduct };
export default productController;
