import express from "express";
import isAuth from "../middlewares/is-auth";
import cartController from "../controllers/cart";
const cartRoutes = express.Router();

cartRoutes.post("/add-product", isAuth, cartController.postAddProduct);
cartRoutes.post("/reduce-product", isAuth, cartController.postReduceProduct);
cartRoutes.post("/fetch-cart", isAuth, cartController.postFetchCart);
cartRoutes.post("/delete-cart", isAuth, cartController.postDeleteCart);
export default cartRoutes;
