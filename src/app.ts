import express from "express";
import bodyParser from "body-parser";
import sequelize from "./utils/database";
import authRoutes from "./routes/authRoutes";
import ResponseError from "./interfaces/ResponseError";
import { Request, Response, NextFunction } from "express";
const app = express();

const application = async () => {
    await sequelize.sync({ force: true });
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
    app.use(bodyParser.json());
    app.use("/auth", authRoutes);
    app.use(
        (
            error: ResponseError,
            req: Request,
            res: Response,
            next: NextFunction
        ) => {
            const status = error.status || 500;
            res.status(status).json({ message: error.message });
        }
    );
    app.listen(8080);
};
application();
