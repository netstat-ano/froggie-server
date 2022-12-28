import { NextFunction, Request, Response } from "express";
import { QueryTypes } from "sequelize";
import Image from "../interfaces/Image";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import ResponseError from "../interfaces/ResponseError";
import sequelize from "../utils/database";
import Product from "../models/Product";
import fs from "fs";
import path from "path";
import { validationResult } from "express-validator";

const postCreateProduct = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const valResult = validationResult(req);
    if (!valResult.isEmpty()) {
        let errors = "";
        const errorsArray = valResult.array();
        for (const index in errorsArray) {
            errors += errorsArray[index].msg + " ";
        }
        res.status(422).json({ message: errors, ok: false });
        return;
    }
    if (req.files) {
        const paths = [];
        const files = req.files as Image[];
        for (const img of files) {
            paths.push(img.path);
        }

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
const postUpdateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const valResult = validationResult(req);
        if (!valResult.isEmpty()) {
            let errors = "";
            const errorsArray = valResult.array();
            for (const index in errorsArray) {
                errors += errorsArray[index].msg + " ";
            }
            res.status(422).json({ message: errors, ok: false });
            return;
        }
        const paths = [];
        if (req.files) {
            const files = req.files as Image[];
            for (const img of files) {
                paths.push(img.path);
            }
        } else {
            res.status(404).json({ message: "Images empty", ok: false });
        }
        const [products, metaP] = await sequelize.query(
            `SELECT * FROM products WHERE id = :id;`,
            { replacements: { id: req.body.ProductId } }
        );
        for (const product of products as Product[]) {
            for (const url of product.imagesURL) {
                fs.unlink(path.join(__dirname, "..", "..", url), (err) => {
                    if (err) {
                        next(err);
                    }
                });
            }
        }
        const [result, meta] = await sequelize.query(
            `UPDATE products SET name = :name, description = :description, price = :price, CategoryId = :CategoryId, imagesURL = :imagesURL WHERE id = :ProductId;`,
            {
                replacements: {
                    name: req.body.productName,
                    description: req.body.description,
                    imagesURL: JSON.stringify(paths),
                    CategoryId: req.body.CategoryId,
                    price: req.body.price,
                    ProductId: req.body.ProductId,
                },
            }
        );
        res.status(200).json({ message: "Product updated!", ok: true });
    } catch (err) {
        next(err);
    }
};
const productController = {
    postCreateProduct,
    postFetchProducts,
    postFetchProductByCategory,
    postFetchProductByPk,
    postUpdateProduct,
};
export default productController;
