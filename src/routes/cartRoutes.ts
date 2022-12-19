import express from "express";
import isAuth from "../middlewares/is-auth";
import cartController from "../controllers/cart";
const cartRoutes = express.Router();

cartRoutes.post("/add-product", isAuth, cartController.postAddProduct);
export default cartRoutes;
