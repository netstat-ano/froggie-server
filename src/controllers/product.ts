import { NextFunction, Request, Response } from "express";
import multer from "multer";
import Image from "../interfaces/Image";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import ResponseError from "../interfaces/ResponseError";
import User from "../models/User";

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

        const currentUser = await User.findByPk(req.userId);

        currentUser!.createProduct({
            name: req.body.productName,
            description: req.body.description,
            imagesURL: JSON.stringify(paths),
        });
    } else {
        const err: ResponseError = new Error("Files are required");
        err.status = 422;
        throw err;
    }
};
const productController = { createProduct };
export default productController;
