import e, { NextFunction, Request, Response } from "express";
import { QueryTypes } from "sequelize";
import Image from "../interfaces/Image";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import ResponseError from "../interfaces/ResponseError";
import sequelize from "../utils/database";
import Product from "../models/Product";
import FTP from "ftp";
import { validationResult } from "express-validator";
import socket from "../socket";

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

        const [id] = await sequelize.query(
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
        res.status(201).json({ message: id, ok: true });
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
    let sort = "";
    if (
        req.body.sort === "products.price ASC" ||
        req.body.sort === "products.price DESC"
    ) {
        sort = req.body.sort;
    }
    if (sort) {
        var [products, meta] = await sequelize.query(
            `SELECT * FROM products WHERE CategoryId = :CategoryId ORDER BY ${sort}`,
            {
                replacements: {
                    CategoryId: req.body.categoryId,
                },
            }
        );
    } else {
        var [products, meta] = await sequelize.query(
            "SELECT * FROM products WHERE CategoryId = :CategoryId",
            {
                replacements: {
                    CategoryId: req.body.categoryId,
                },
            }
        );
    }
    for (const product of products as Product[]) {
        if (typeof product.imagesURL === "string") {
            product.imagesURL = JSON.parse(product.imagesURL);
        }
    }
    if (products.length > 0) {
        res.status(200).json(products);
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
        if (typeof product.imagesURL === "string") {
            product.imagesURL = JSON.parse(product.imagesURL);
        }

        res.status(200).json({ product, ok: true });
    }
};
const postDeleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const product = await Product.findByPk(req.body.id);
    if (product) {
        const ftp = new FTP();
        ftp.connect({
            host: process.env.FTP_HOST,
            port: 21,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
        });
        ftp.on("ready", () => {
            const urls = JSON.parse(product.imagesURL);
            for (const url of urls) {
                ftp.delete(url, (err) => {
                    if (err) {
                        next(err);
                    }
                });
            }
            ftp.end();
        });
        await product.destroy();
        res.status(200).json({ message: "Products deleted", ok: true });
    } else {
        res.status(404).json({ message: "Product not found", ok: false });
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
        const io = socket.getIo();
        io.emit("product", { action: "UPDATE" });
        res.status(200).json({ message: "Product updated!", ok: true });
    } catch (err) {
        next(err);
    }
};
const postFetchAverageRate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const [rate, meta] = await sequelize.query(
        "SELECT ROUND(AVG(rate), 1) as rate FROM comments WHERE ProductId = :ProductId",
        {
            replacements: {
                ProductId: req.body.ProductId,
            },
        }
    );
    const parsedRate = rate as [{ rate: null | number }];
    if (rate.length > 0) {
        res.status(200).json({ rate: parsedRate[0].rate, ok: true });
        return;
    } else {
        res.status(404).json({ message: "Product not found", ok: false });
    }
};
const productController = {
    postCreateProduct,
    postFetchProducts,
    postFetchProductByCategory,
    postFetchProductByPk,
    postUpdateProduct,
    postFetchAverageRate,
    postDeleteProduct,
};
export default productController;
