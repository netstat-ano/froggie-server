import express from "express";
import bodyParser from "body-parser";
import sequelize from "./utils/database";
import authRoutes from "./routes/authRoutes";
import ResponseError from "./interfaces/ResponseError";
import { Request, Response, NextFunction } from "express";
import Multer, { FileFilterCallback } from "multer";
import Categorie from "./models/Categorie";
import User from "./models/User";
import Product from "./models/Product";
import path from "path";
import multer from "multer";
import productRoutes from "./routes/productRoutes";
const app = express();

const application = async () => {
    const fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "public/images");
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    });

    const fileFilter = (
        req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) => {
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    };
    Categorie.hasMany(Product);
    Product.belongsTo(Categorie, { onDelete: "CASCADE" });
    User.hasMany(Product, {
        sourceKey: "id",
        foreignKey: "UserId",
        as: "products",
    });
    await sequelize.sync();
    app.use(bodyParser.json());
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, PATCH, DELETE"
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        next();
    });
    app.use("/images", express.static(path.join(__dirname, "images")));
    app.use(
        multer({ storage: fileStorage, fileFilter: fileFilter }).array(
            "images",
            8
        )
    );

    app.use("/auth", authRoutes);
    app.use("/product", productRoutes);
    app.use(
        (
            error: ResponseError,
            req: Request,
            res: Response,
            next: NextFunction
        ) => {
            const status = error.status || 500;
            console.log(error);

            res.status(status).json({ message: error.message });
        }
    );

    app.listen(8080);
};
application();
