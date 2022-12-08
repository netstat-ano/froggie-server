import express from "express";
import productController from "../controllers/product";
import isAdminAuth from "../middlewares/is-admin-auth";
const productRoutes = express.Router();

productRoutes.post(
    "/create-product",
    isAdminAuth,
    productController.createProduct
);

export default productRoutes;
