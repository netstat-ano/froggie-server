import express from "express";
import isAuth from "../middlewares/is-auth";
import cartController from "../controllers/cart";
import isCustomerAuth from "../middlewares/is-customer-auth";
const cartRoutes = express.Router();

cartRoutes.post("/add-product", isCustomerAuth, cartController.postAddProduct);
cartRoutes.post(
    "/reduce-product",
    isCustomerAuth,
    cartController.postReduceProduct
);
cartRoutes.post("/fetch-cart", isCustomerAuth, cartController.postFetchCart);
cartRoutes.post("/delete-cart", isCustomerAuth, cartController.postDeleteCart);
export default cartRoutes;
