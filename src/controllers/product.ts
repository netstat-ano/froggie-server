import { NextFunction, Request, Response } from "express";
import { QueryTypes } from "sequelize";
import Image from "../interfaces/Image";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import ResponseError from "../interfaces/ResponseError";
import sequelize from "../utils/database";
import Product from "../models/Product";
import Category from "../models/Category";
import User from "../models/User";

const postCreateProduct = async (
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
        console.log(req.body);

        sequelize.query(
            `INSERT INTO products(name, description, imagesURL, price, CategoryId, UserId)
            VALUES(:name, :description, :imagesURL, :price, :CategoryId, :UserId);`,
            {
                replacements: {
                    name: req.body.productName,
                    description: req.body.description,
                    imagesURL: JSON.stringify(paths),
                    CategoryId: req.body.categoryId,
                    UserId: req.userId,
                    price: req.body.price,
                },
                type: QueryTypes.INSERT,
            }
        );
    } else {
        const err: ResponseError = new Error("Files are required");
        err.status = 422;
        throw err;
    }
};
const postFetchProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const products = await Product.findAll();
    if (!products) {
    }
};

const postFetchProductByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const [product, meta] = await sequelize.query(
        "SELECT * FROM products WHERE CategoryId = :CategoryId",
        {
            replacements: {
                CategoryId: req.body.categoryId,
            },
        }
    );
    if (product.length > 0) {
        res.status(200).json(product);
    } else {
        res.status(404).json({ message: "Products not found", ok: false });
    }
};

const postFetchProductByPk = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const product = await Product.findByPk(req.body.id);
    if (!product) {
        res.status(404).json({
            message: "This product doesn't exist.",
            ok: false,
        });
    } else {
        res.status(200).json({ product, ok: true });
    }
};
const productController = {
    postCreateProduct,
    postFetchProducts,
    postFetchProductByCategory,
    postFetchProductByPk,
};
export default productController;
