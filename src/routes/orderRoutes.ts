import express from "express";
import isAuth from "../middlewares/is-auth";
import orderController from "../controllers/order";
import { body } from "express-validator";
const orderRoutes = express.Router();

orderRoutes.post(
    "/add-order",
    [
        body("name").notEmpty().withMessage("Name is required."),
        body("surname").notEmpty().withMessage("Surname is required."),
        body("address").notEmpty().withMessage("Address is required."),
        body("postalCode").notEmpty().withMessage("Postal code is required."),
        body("city").notEmpty().withMessage("City is required."),
    ],
    isAuth,
    orderController.postAddOrder
);
orderRoutes.post(
    "/fetch-orders-by-user",
    isAuth,
    orderController.postFetchOrdersByUser
);
orderRoutes.post(
    "/check-if-user-purchase",
    isAuth,
    orderController.postCheckIfUserPurchase
);
export default orderRoutes;
