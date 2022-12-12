import express from "express";
import categoryController from "../controllers/category";
import { body } from "express-validator/check";
import isAdminAuth from "../middlewares/is-admin-auth";
const categoryRoutes = express.Router();

categoryRoutes.post(
    "/add-category",
    isAdminAuth,
    body("name").notEmpty(),
    categoryController.postAddCategory
);

categoryRoutes.delete(
    "/delete-category",
    isAdminAuth,
    categoryController.deleteCategory
);

categoryRoutes.post(
    "/fetch-categories",
    categoryController.postFetchCategories
);
export default categoryRoutes;
