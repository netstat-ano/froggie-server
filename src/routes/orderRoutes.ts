import express from "express";
import isAuth from "../middlewares/is-auth";
import orderController from "../controllers/order";
import { body } from "express-validator";
import isAdminAuth from "../middlewares/is-admin-auth";
import isCustomerAuth from "../middlewares/is-customer-auth";
const orderRoutes = express.Router();

orderRoutes.post(
    "/add-order",
    [
        body("name").notEmpty().withMessage("Name is required."),
        body("surname").notEmpty().withMessage("Surname is required."),
        body("grade").notEmpty().withMessage("Grade is required."),
        body("classroom").custom((classroom, { req }) => {
            if (
                (!req.body.locker && typeof classroom === "number") ||
                req.body.locker
            ) {
                return true;
            }
            throw new Error("Classroom is required.");
        }),
        body("locker").custom((locker, { req }) => {
            if (
                (!req.body.classroom && typeof locker === "number") ||
                req.body.classroom
            ) {
                return true;
            }
            throw new Error("Locker is required.");
        }),
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
orderRoutes.post("/fetch-orders", isAdminAuth, orderController.postFetchOrders);
orderRoutes.post(
    "/complete-order",
    isAdminAuth,
    orderController.postCompleteOrder
);
orderRoutes.post(
    "/uncomplete-order",
    isAdminAuth,
    orderController.postUncompleteOrder
);
orderRoutes.post("/cancel-order", isAdminAuth, orderController.postCancelOrder);
orderRoutes.post(
    "/fetch-completed-orders",
    isAdminAuth,
    orderController.postFetchCompletedOrders
);
orderRoutes.post(
    "/fetch-canceled-orders",
    isAdminAuth,
    orderController.postFetchCanceledOrders
);
orderRoutes.post(
    "/fetch-uncompleted-orders",
    orderController.postFetchUncompletedOrders
);
orderRoutes.post(
    "/fetch-canceled-orders-by-user",
    isCustomerAuth,
    orderController.postFetchCanceledOrdersByUserId
);
orderRoutes.post(
    "/fetch-completed-orders-by-user",
    isCustomerAuth,
    orderController.postFetchCompletedOrdersByUserId
);
orderRoutes.post(
    "/fetch-uncompleted-orders-by-user",
    isCustomerAuth,
    orderController.postFetchUncompletedOrdersByUserId
);
export default orderRoutes;
