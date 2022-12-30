import express from "express";
import authController from "../controllers/auth";
import { body } from "express-validator/check";
const authRoutes = express.Router();

authRoutes.post(
    "/create-user",
    [
        body("email").isEmail().withMessage("Invalid e-mail format."),
        body("username")
            .isLength({ min: 4 })
            .withMessage("Username must contains min 4 character."),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must contains min 8 characters."),
    ],
    authController.postCreateUser
);
authRoutes.post(
    "/login-user",
    [
        body("email").isEmail().withMessage("Invalid e-mail format."),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must contains min 8 characters."),
    ],
    authController.postLoginUser
);
authRoutes.post("/fetch-user-details", authController.postFetchUserDetails);
export default authRoutes;
