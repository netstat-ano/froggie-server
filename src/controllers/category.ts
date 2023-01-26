import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import Category from "../models/Category";
import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import ResponseError from "../interfaces/ResponseError";
import sequelize from "../utils/database";
import Product from "../models/Product";
import initFtp from "../utils/ftp";
import FTP from "ftp";
import jsftp from "jsftp";

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
        const categories = await Category.findAll({
            attributes: ["id", "name"],
        });
        if (categories.length === 0) {
            res.status(404).json({
                message: "Categories not found",
                ok: false,
            });
            return;
        }
        res.status(200).json({ categories: categories });
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
            const ftp = new FTP();
            ftp.connect({
                host: process.env.FTP_HOST,
                port: 22,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
            });
            ftp.on("ready", () => {
                for (const product of products as Product[]) {
                    const urls = JSON.parse(product.imagesURL);
                    for (const url of urls) {
                        ftp.delete(url, (err) => {
                            if (err) {
                                next(err);
                            }
                        });
                    }
                }
                ftp.end();
            });

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
