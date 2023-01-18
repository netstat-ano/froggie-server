import express from "express";
import bodyParser from "body-parser";
import sequelize from "./utils/database";
import authRoutes from "./routes/authRoutes";
import ResponseError from "./interfaces/ResponseError";
import { Request, Response, NextFunction } from "express";
import { FileFilterCallback } from "multer";
import CartItems from "./models/CartItems";
import Category from "./models/Category";
import User from "./models/User";
import Product from "./models/Product";
import path from "path";
import multer from "multer";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import Cart from "./models/Cart";
import Order from "./models/Order";
import orderRoutes from "./routes/orderRoutes";
import commentRoutes from "./routes/commentRoutes";
import cartRoutes from "./routes/cartRoutes";
import OrderItems from "./models/OrderItems";
import Comment from "./models/Comment";
import Dislikes from "./models/Dislikes";
import Likes from "./models/Likes";
import Notification from "./models/Notification";
import notificationRoutes from "./routes/notificationRoutes";
import socket from "./socket";
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
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/webp"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    };
    Comment.belongsToMany(User, {
        through: Likes,
    });
    Comment.belongsToMany(User, {
        through: Dislikes,
    });
    Cart.belongsToMany(Product, {
        through: CartItems,
    });
    Product.belongsToMany(Cart, { through: CartItems });
    Cart.belongsTo(User);
    User.hasOne(Cart);
    User.hasMany(Order);
    Order.belongsTo(User);
    Order.belongsToMany(Product, { through: OrderItems });
    Product.belongsToMany(Order, { through: OrderItems });
    User.hasMany(Comment);
    User.hasMany(Notification);
    Notification.belongsTo(User);
    Comment.belongsTo(User);
    Comment.belongsTo(Product);
    Product.hasMany(Comment);
    Category.hasMany(Product, {
        foreignKey: "CategoryId",
        onDelete: "cascade",
    });
    Product.belongsTo(Category, {
        foreignKey: "CategoryId",
    });
    User.hasMany(Product, {
        sourceKey: "id",
        foreignKey: "UserId",
    });
    Product.belongsTo(User, { foreignKey: "UserId" });

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
    app.use(express.static("public"));
    app.use("/public/images", express.static(path.join("public/images")));
    app.use(
        multer({ storage: fileStorage, fileFilter: fileFilter }).array(
            "images",
            8
        )
    );
    app.use("/order", orderRoutes);
    app.use("/category", categoryRoutes);
    app.use("/auth", authRoutes);
    app.use("/product", productRoutes);
    app.use("/cart", cartRoutes);
    app.use("/comment", commentRoutes);
    app.use("/notification", notificationRoutes);
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

    const server = app.listen(process.env.PORT || 8080);
    socket.init(server);
};
application();
