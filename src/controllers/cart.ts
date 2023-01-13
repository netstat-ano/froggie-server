import e, { NextFunction, Request, Response } from "express";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import Cart from "../models/Cart";
import sequelize from "../utils/database";
import CartItems from "../models/CartItems";
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
                "INSERT INTO cartitems(amount, ProductId, CartId) VALUES(1, :ProductId, :CartId)",
                {
                    replacements: {
                        ProductId: req.body.id,
                        CartId: cartId,
                    },
                }
            );
            res.status(201).json({
                message: "Cart initialized. Product inserted.",
                ok: true,
            });
        } else {
            const item = await CartItems.findOne({
                where: {
                    CartId: findedCart.id,
                    ProductId: req.body.id,
                },
            });
            if (item) {
                item.amount++;
                item.save();
                res.status(201).json({
                    message: "Amount of product increased by 1.",
                });
            } else {
                await sequelize.query(
                    "INSERT INTO cartitems(amount, ProductId, CartId) VALUES(1, :ProductId, :CartId)",
                    {
                        replacements: {
                            ProductId: req.body.id,
                            CartId: findedCart.id,
                        },
                    }
                );
                res.status(201).json({
                    message: "Product inserted",
                });
            }
        }
    } catch (err) {
        next(err);
    }
};

const postReduceProduct = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const cart = await Cart.findOne({
            where: {
                UserId: req.userId,
            },
        });
        if (!cart) {
            res.status(404).json({ message: "Cart doesn't exist", ok: false });
        }
        const findedCartItem = await CartItems.findOne({
            where: {
                ProductId: req.body.id,
            },
        });
        if (!findedCartItem) {
            res.status(404).json({ message: "Product not found", ok: false });
        } else {
            findedCartItem.amount -= req.body.quantity;
            if (findedCartItem.amount === 0) {
                findedCartItem.destroy();
                res.status(204).json({ message: "Product deleted.", ok: true });
            } else {
                findedCartItem.save();
                res.status(204).json({ message: "Product reduced.", ok: true });
            }
        }
    } catch (err) {
        next(err);
    }
};
const postFetchCart = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const [result, meta] = await sequelize.query(
        `SELECT products.id, products.name, products.description, products.imagesURL, products.price, cartitems.amount FROM products 
    JOIN cartitems on cartitems.ProductId = products.id
    JOIN carts on carts.id = cartitems.CartId
    JOIN users on users.id = carts.UserId
    WHERE users.id = :UserId;`,
        {
            replacements: {
                UserId: req.userId,
            },
        }
    );

    if (result.length > 0) {
        var cart = result[0] as any;
        cart.imagesURL = JSON.parse(cart.imagesURL);
    }
    if (cart) {
        res.status(200).json({ cart: [cart], ok: true });
        return;
    } else {
        res.status(404).json({ message: "Cart doesn't founded", ok: false });
    }
};
const postDeleteCart = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const foundedCart = await Cart.findOne({
            where: {
                UserId: req.userId,
            },
        });
        if (foundedCart) {
            foundedCart.destroy();
            res.status(204).json({
                message: "Cart successfully deleted.",
                ok: true,
            });
            return;
        } else {
            res.status(404).json({ message: "Cart doesn't exist", ok: false });
            return;
        }
    } catch (err) {
        next(err);
    }
};
export default {
    postAddProduct,
    postReduceProduct,
    postFetchCart,
    postDeleteCart,
};
