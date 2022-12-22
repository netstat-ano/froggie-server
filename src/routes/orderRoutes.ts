import express from "express";
import isAuth from "../middlewares/is-auth";
import orderController from "../controllers/order";
const orderRoutes = express.Router();

orderRoutes.post("/add-order", isAuth, orderController.postAddOrder);
orderRoutes.post(
    "/fetch-orders-by-user",
    isAuth,
    orderController.postFetchOrdersByUser
);
export default orderRoutes;
