import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import e, { Response, NextFunction, Request } from "express";
import { validationResult } from "express-validator";
import errorsArrayToString from "../utils/errorsArrayToString";
import sequelize from "../utils/database";
const postAddComment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        const errors = errorsArrayToString(validationErrors.array());
        res.status(422).json({ message: errors, ok: false });
        return;
    }
    const [confirmedByPurchase, metaProduct] = await sequelize.query(
        "SELECT orderitems.id FROM orderitems JOIN orders on orders.id = orderitems.OrderId WHERE ProductId = :ProductId AND orders.UserId = :UserId",
        {
            replacements: {
                ProductId: req.body.ProductId,
                UserId: req.userId,
            },
        }
    );
    let isConfirmed = false;
    if (confirmedByPurchase.length > 0) {
        isConfirmed = true;
    }
    var [CommentId, meta] = await sequelize.query(
        "INSERT INTO comments(commentText, UserId, ProductId, rate, confirmedByPurchase) VALUES(:commentText, :UserId, :ProductId, :rate, :confirmedByPurchase);",
        {
            replacements: {
                UserId: req.userId,
                commentText: req.body.commentText,
                ProductId: req.body.ProductId,
                rate: req.body.rate,
                confirmedByPurchase: isConfirmed,
            },
        }
    );

    const [comment, metaC] = await sequelize.query(
        "SELECT * FROM comments WHERE id = :CommentId;",
        {
            replacements: {
                CommentId,
            },
        }
    );
    res.status(201).json({ comment: comment[0], ok: true });
};

const postFetchComments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const [comments, meta] = await sequelize.query(
        "SELECT * FROM comments WHERE ProductId = :ProductId",
        {
            replacements: {
                ProductId: req.body.ProductId,
            },
        }
    );
    if (comments.length > 0) {
        res.status(200).json({ comments });
        return;
    }
    res.status(404).json({ message: "Comments not found", ok: false });
};
export default { postAddComment, postFetchComments };
