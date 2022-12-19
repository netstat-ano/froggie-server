"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const database_1 = __importDefault(require("./utils/database"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const CartItems_1 = __importDefault(require("./models/CartItems"));
const Category_1 = __importDefault(require("./models/Category"));
const User_1 = __importDefault(require("./models/User"));
const Product_1 = __importDefault(require("./models/Product"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const Cart_1 = __importDefault(require("./models/Cart"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const app = (0, express_1.default)();
const application = () => __awaiter(void 0, void 0, void 0, function* () {
    const fileStorage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "public/images");
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    });
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/webp") {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    };
    Cart_1.default.belongsToMany(Product_1.default, {
        through: CartItems_1.default,
    });
    Product_1.default.belongsToMany(Cart_1.default, { through: CartItems_1.default });
    Cart_1.default.belongsTo(User_1.default);
    User_1.default.hasOne(Cart_1.default);
    Category_1.default.hasMany(Product_1.default, {
        foreignKey: "CategoryId",
        onDelete: "cascade",
    });
    Product_1.default.belongsTo(Category_1.default, {
        foreignKey: "CategoryId",
    });
    User_1.default.hasMany(Product_1.default, {
        sourceKey: "id",
        foreignKey: "UserId",
    });
    Product_1.default.belongsTo(User_1.default, { foreignKey: "UserId" });
    yield database_1.default.sync();
    app.use(body_parser_1.default.json());
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        next();
    });
    app.use(express_1.default.static("public"));
    app.use("/public/images", express_1.default.static(path_1.default.join("public/images")));
    app.use((0, multer_1.default)({ storage: fileStorage, fileFilter: fileFilter }).array("images", 8));
    app.use("/category", categoryRoutes_1.default);
    app.use("/auth", authRoutes_1.default);
    app.use("/product", productRoutes_1.default);
    app.use("/cart", cartRoutes_1.default);
    app.use((error, req, res, next) => {
        const status = error.status || 500;
        console.log(error);
        res.status(status).json({ message: error.message });
    });
    app.listen(8080);
});
application();
