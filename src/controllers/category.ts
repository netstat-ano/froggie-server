import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import Category from "../models/Category";
import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import ResponseError from "../interfaces/ResponseError";
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
        await Category.create({
            name: req.body.name,
        });
        res.status(201).json({ message: "Category added succesfully." });
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

const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        console.log(req.body.id);

        const findedCategory = await Category.findByPk(req.body.id);
        if (findedCategory) {
            findedCategory.destroy();
            res.status(200);
        } else {
            const error = new Error("Cannot find category with this id.");
            throw error;
        }
    } catch (err) {
        next(err);
    }
};

export default { postAddCategory, postFetchCategories, deleteCategory };
