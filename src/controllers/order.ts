import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import { NextFunction, Request, Response } from "express";
import sequelize from "../utils/database";
import CartItems from "../models/CartItems";
const postAddOrder = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const [orderId, meta] = await sequelize.query(
            "INSERT INTO orders(UserId) VALUES(:UserId)",
            {
                replacements: {
                    UserId: req.userId,
                },
            }
        );
        const cartItems = req.body.cartItems as CartItems[];
        cartItems.forEach(async (item) => {
            const [result, meta] = await sequelize.query(
                "INSERT INTO orderitems(amount, OrderId, ProductId) VALUES(:amount, :OrderId, :ProductId)",
                {
                    replacements: {
                        amount: item.amount,
                        OrderId: orderId,
                        ProductId: item.id,
                    },
                }
            );
        });
        res.status(201).json({
            message: "Order created successfully",
            ok: true,
        });
    } catch (err) {
        next(err);
    }
};
const postFetchOrdersByUser = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const [orders, meta] = await sequelize.query(
            `SELECT orderitems.amount, products.name, products.imagesURL, products.CategoryId, products.price, products.description, orderitems.OrderId  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE orders.UserId = :UserId;`,
            {
                replacements: {
                    UserId: req.userId,
                },
            }
        );

        res.status(200).json({
            orders: orders,
            message: "Orders fetched succesfully",
            ok: true,
        });
    } catch (err) {
        next(err);
    }
};
export default { postAddOrder, postFetchOrdersByUser };
