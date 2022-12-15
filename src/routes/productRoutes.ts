import express from "express";
import productController from "../controllers/product";
import isAdminAuth from "../middlewares/is-admin-auth";
import { body } from "express-validator/check";
const productRoutes = express.Router();

productRoutes.post(
    "/create-product",
    isAdminAuth,
    productController.postCreateProduct
);
productRoutes.post("/fetch-products", productController.postFetchProducts);

productRoutes.post(
    "/fetch-product-by-category",
    productController.postFetchProductByCategory
);

productRoutes.post(
    "/fetch-product-by-pk",
    productController.postFetchProductByPk
);
export default productRoutes;
