import express from "express";
import comment from "../controllers/comment";
import { body } from "express-validator";
import isAuth from "../middlewares/is-auth";
const commentRoutes = express.Router();

commentRoutes.post(
    "/add-comment",
    [
        body("commentText")
            .trim()
            .isLength({ min: 8 })
            .withMessage("Comment content is required."),
        body("rate")
            .notEmpty()
            .isInt({ min: 1, max: 5 })
            .withMessage("Rate is required."),
    ],
    isAuth,
    comment.postAddComment
);
commentRoutes.post("/fetch-comments", comment.postFetchComments);
commentRoutes.post("/update-comment", isAuth, comment.postUpdateComment);
commentRoutes.post("/delete-comment", isAuth, comment.postDeleteComment);
export default commentRoutes;
