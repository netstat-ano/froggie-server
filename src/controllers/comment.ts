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
    let sortType = "";
    let sortingByReactions = false;
    if (req.body.sort) {
        if (req.body.sort === "NEWEST") {
            sortType = "DESC";
        } else if (req.body.sort === "OLDEST") {
            sortType = "ASC";
        } else if (
            req.body.sort === "LIKES ASC" ||
            req.body.sort === "LIKES DESC" ||
            req.body.sort === "DISLIKES ASC" ||
            req.body.sort === "DISLIKES DESC"
        ) {
            sortType = req.body.sort;
            sortingByReactions = true;
        }
    }

    if (sortType && !sortingByReactions) {
        var [comments, meta] = await sequelize.query(
            `SELECT * FROM comments WHERE ProductId = :ProductId ORDER BY createdAt ${sortType}`,
            {
                replacements: {
                    ProductId: req.body.ProductId,
                },
            }
        );
    } else if (sortType && sortingByReactions) {
        var [comments, meta] = await sequelize.query(
            `SELECT comments.id, commentText, rate, confirmedByPurchase, createdAt, updatedAt, comments.UserId, productId, COUNT(likes.id) as likes, 
            COUNT(dislikes.id) as dislikes FROM comments 
            LEFT JOIN likes ON likes.CommentId = comments.id
            LEFT JOIN dislikes on dislikes.CommentId = comments.id
            WHERE ProductId = :ProductId
            GROUP BY comments.id 
            ORDER BY ${sortType}`,
            {
                replacements: {
                    ProductId: req.body.ProductId,
                },
            }
        );
    } else {
        var [comments, meta] = await sequelize.query(
            "SELECT * FROM comments WHERE ProductId = :ProductId",
            {
                replacements: {
                    ProductId: req.body.ProductId,
                },
            }
        );
    }
    if (comments.length > 0) {
        res.status(200).json({ comments });
        return;
    }
    res.status(404).json({ message: "Comments not found", ok: false });
};
const postUpdateComment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const [isCommentRelatedToUser, meta] = await sequelize.query(
            "SELECT id FROM comments WHERE id = :id AND UserId = :UserId",
            {
                replacements: {
                    id: req.body.id,
                    UserId: req.userId,
                },
            }
        );

        if (isCommentRelatedToUser.length > 0) {
            const [updated, metaC] = await sequelize.query(
                "UPDATE comments SET commentText = :commentText, rate = :rate WHERE id = :id",
                {
                    replacements: {
                        commentText: req.body.commentText,
                        rate: req.body.rate,
                        id: req.body.id,
                    },
                }
            );
            const [comment] = await sequelize.query(
                "SELECT * FROM comments WHERE id = :id",
                {
                    replacements: {
                        id: req.body.id,
                    },
                }
            );

            res.status(200).json({ comment: comment[0], ok: true });
            return;
        } else {
            res.status(422).json({ message: "Bad data", ok: false });
            return;
        }
    } catch (err) {
        next(err);
    }
};
const postDeleteComment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const [result] = await sequelize.query(
            "DELETE FROM comments WHERE id = :id",
            {
                replacements: {
                    id: req.body.id,
                },
            }
        );
        res.status(200).json({ message: "Comment deleted", ok: true });
        return;
    } catch (err) {
        next(err);
    }
};
const postLikeComment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const [isUserLikeIt] = await sequelize.query(
        "SELECT * FROM likes WHERE UserId = :UserId AND CommentId = :CommentId",
        {
            replacements: {
                UserId: req.userId,
                CommentId: req.body.id,
            },
        }
    );
    if (isUserLikeIt.length > 0) {
        res.status(200).json({ message: "User likes it already", ok: false });
        return;
    }
    const [isUserDislikeIt] = await sequelize.query(
        "SELECT * FROM dislikes WHERE UserId = :UserId AND CommentId = :CommentId",
        {
            replacements: {
                UserId: req.userId,
                CommentId: req.body.id,
            },
        }
    );
    if (isUserDislikeIt.length > 0) {
        const dislike = isUserDislikeIt[0] as { id: number };
        await sequelize.query("DELETE FROM dislikes WHERE id = :id", {
            replacements: {
                id: dislike.id,
            },
        });
    }
    await sequelize.query(
        "INSERT INTO likes(CommentId, UserId) VALUES(:CommentId, :UserId)",
        {
            replacements: {
                CommentId: req.body.id,
                UserId: req.userId,
            },
        }
    );
    const [currentLikes] = await sequelize.query(
        "SELECT count(CommentId) as likes FROM likes WHERE CommentId = :CommentId",
        {
            replacements: {
                CommentId: req.body.id,
            },
        }
    );
    const [currentDislikes] = await sequelize.query(
        "SELECT count(CommentId) as dislikes FROM dislikes WHERE CommentId = :CommentId",
        {
            replacements: {
                CommentId: req.body.id,
            },
        }
    );
    const likes = currentLikes as { likes: number }[];
    const dislikes = currentDislikes as { dislikes: number }[];
    res.status(200).json({
        likes: likes[0].likes,
        dislikes: dislikes[0].dislikes,
        ok: true,
    });
};

const postDislikeComment = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const [isUserDislikeIt] = await sequelize.query(
        "SELECT * FROM dislikes WHERE UserId = :UserId AND CommentId = :CommentId",
        {
            replacements: {
                UserId: req.userId,
                CommentId: req.body.id,
            },
        }
    );
    if (isUserDislikeIt.length > 0) {
        res.status(200).json({ message: "User likes it already", ok: false });
        return;
    }
    const [isUserLikeIt] = await sequelize.query(
        "SELECT * FROM likes WHERE UserId = :UserId AND CommentId = :CommentId",
        {
            replacements: {
                UserId: req.userId,
                CommentId: req.body.id,
            },
        }
    );
    if (isUserLikeIt.length > 0) {
        const dislike = isUserLikeIt[0] as { id: number };
        await sequelize.query("DELETE FROM likes WHERE id = :id", {
            replacements: {
                id: dislike.id,
            },
        });
    }
    await sequelize.query(
        "INSERT INTO dislikes(CommentId, UserId) VALUES(:CommentId, :UserId)",
        {
            replacements: {
                CommentId: req.body.id,
                UserId: req.userId,
            },
        }
    );
    const [currentLikes] = await sequelize.query(
        "SELECT count(CommentId) as likes FROM likes WHERE CommentId = :CommentId",
        {
            replacements: {
                CommentId: req.body.id,
            },
        }
    );
    const [currentDislikes] = await sequelize.query(
        "SELECT count(CommentId) as dislikes FROM dislikes WHERE CommentId = :CommentId",
        {
            replacements: {
                CommentId: req.body.id,
            },
        }
    );
    const likes = currentLikes as { likes: number }[];
    const dislikes = currentDislikes as { dislikes: number }[];
    res.status(200).json({
        likes: likes[0].likes,
        dislikes: dislikes[0].dislikes,
        ok: true,
    });
};
const postFetchReactions = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const [currentLikes] = await sequelize.query(
        "SELECT count(CommentId) as likes FROM likes WHERE CommentId = :CommentId",
        {
            replacements: {
                CommentId: req.body.id,
            },
        }
    );
    const [currentDislikes] = await sequelize.query(
        "SELECT count(CommentId) as dislikes FROM dislikes WHERE CommentId = :CommentId",
        {
            replacements: {
                CommentId: req.body.id,
            },
        }
    );
    const likes = currentLikes as { likes: number }[];
    const dislikes = currentDislikes as { dislikes: number }[];
    if (!likes[0].likes) {
        likes[0].likes = 0;
    }
    if (!dislikes[0].dislikes) {
        dislikes[0].dislikes = 0;
    }
    res.status(200).json({
        likes: likes[0].likes,
        dislikes: dislikes[0].dislikes,
        ok: true,
    });
};
export default {
    postAddComment,
    postFetchComments,
    postUpdateComment,
    postDeleteComment,
    postLikeComment,
    postDislikeComment,
    postFetchReactions,
};
