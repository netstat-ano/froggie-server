import { NextFunction, Request, Response } from "express";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import Cart from "../models/Cart";
import sequelize from "../utils/database";
const postAddProduct = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const findedCart = await Cart.findOne({
            where: {
                UserId: req.userId,
            },
        });
        if (!findedCart) {
            const [cartId, meta] = await sequelize.query(
                "INSERT INTO carts(UserId) VALUES(:UserId)",
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );

            await sequelize.query(
                "INSERT INTO cartitems(ProductId, CartId) VALUES(:ProductId, :CartId)",
                {
                    replacements: {
                        ProductId: req.body.id,
                        CartId: cartId,
                    },
                }
            );
        } else {
        }
    } catch (err) {
        next(err);
    }
};
export default { postAddProduct };
