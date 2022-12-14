import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import Category from "../models/Category";
import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import ResponseError from "../interfaces/ResponseError";
import sequelize from "../utils/database";
import Product from "../models/Product";
import fs from "fs";
import path from "path";
const postAddCategory = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error: ResponseError = new Error("Empty name field");
        error.status = 422;
        throw error;
    }
    try {
        const addedCategory = await Category.create({
            name: req.body.name,
        });
        res.status(201).json({ category: addedCategory });
    } catch (err) {
        next(err);
    }
};

const postFetchCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await Category.findAll({ attributes: ["id", "name"] });
        res.status(200).json({ categories: response });
    } catch (err) {
        next(err);
    }
};

const postDeleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const findedCategory = await Category.findByPk(req.body.id);
        if (findedCategory) {
            const [products, meta] = await sequelize.query(
                "SELECT * FROM products WHERE CategoryId = :categoryId",
                { replacements: { categoryId: findedCategory.id } }
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
            await findedCategory.destroy();
            res.status(200).json({ message: "Category has been deleted" });
        } else {
            const error = new Error("Cannot find category with this id.");
            throw error;
        }
    } catch (err) {
        next(err);
    }
};

export default { postAddCategory, postFetchCategories, postDeleteCategory };
