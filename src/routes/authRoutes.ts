import express from "express";
import authController from "../controllers/auth";
import { body } from "express-validator/check";
import isAuth from "../middlewares/is-auth";
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
authRoutes.post(
    "/change-password",
    isAuth,
    [
        body("oldPassword")
            .isLength({ min: 8 })
            .withMessage("Old password must contains min 8 characters."),
        body("newPassword")
            .isLength({ min: 8 })
            .withMessage("New password must contains min 8 characters."),
    ],
    authController.postChangePassword
);
authRoutes.post("/fetch-user-details", authController.postFetchUserDetails);
export default authRoutes;
