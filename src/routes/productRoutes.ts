import express from "express";
import productController from "../controllers/product";
import isAdminAuth from "../middlewares/is-admin-auth";
import { body } from "express-validator/check";
const productRoutes = express.Router();

productRoutes.post(
    "/create-product",
    [
        body("productName").notEmpty().withMessage("Name can't be empty."),
        body("description")
            .notEmpty()
            .withMessage("Description can't be empty."),
        body("price").notEmpty().withMessage("Price can't be empty."),
    ],
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
productRoutes.post(
    "/update-product",
    [
        body("productName").notEmpty().withMessage("Name can't be empty."),
        body("description")
            .notEmpty()
            .withMessage("Description can't be empty."),
        body("price").notEmpty().withMessage("Price can't be empty."),
        body("ProductId").notEmpty().withMessage("Invalid product id."),
    ],
    isAdminAuth,
    productController.postUpdateProduct
);
export default productRoutes;
