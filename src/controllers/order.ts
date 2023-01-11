import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import { NextFunction, Request, Response } from "express";
import sequelize from "../utils/database";
import CartItems from "../models/CartItems";
import { validationResult } from "express-validator";
const postAddOrder = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            const errorsArray = validationErrors.array();
            let errors = "";
            for (const index in errorsArray) {
                errors += errorsArray[index].msg + " ";
            }
            res.status(403).json({
                message: errors,
                ok: false,
            });
            return;
        }
        const [orderId, meta] = await sequelize.query(
            "INSERT INTO orders(UserId, name, surname, address, postalCode, city) VALUES(:UserId, :name, :surname, :address, :postalCode, :city)",
            {
                replacements: {
                    UserId: req.userId,
                    name: req.body.name,
                    surname: req.body.surname,
                    address: req.body.address,
                    postalCode: req.body.postalCode,
                    city: req.body.city,
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
        if (!req.body.sort) {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, orders.name as customerName, orders.surname as customerSurname, orders.address, orders.postalCode, orders.city, products.imagesURL, products.CategoryId, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE orders.UserId = :UserId;`,
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );
        } else {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, orders.name as customerName, orders.surname as customerSurname, orders.address, orders.postalCode, orders.city, products.imagesURL, products.CategoryId, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
                JOIN products on orderitems.ProductId = products.id
                JOIN orders on orders.id = orderitems.OrderId
                WHERE orders.UserId = :UserId
                ORDER BY ${req.body.sort}`,
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );
        }

        if (orders.length > 0) {
            res.status(200).json({
                orders: orders,
                message: "Orders fetched succesfully",
                ok: true,
            });
            return;
        } else {
            res.status(404).json({ message: "Orders not found.", ok: false });
        }
    } catch (err) {
        next(err);
    }
};
const postCheckIfUserPurchase = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const [order, meta] = await sequelize.query(
        "SELECT orderitems.id FROM orderitems JOIN orders ON orders.id = orderitems.OrderId WHERE orders.UserId = :UserId AND orderitems.ProductId = :ProductId",
        {
            replacements: {
                UserId: req.userId,
                ProductId: req.body.id,
            },
        }
    );
    if (order.length > 0) {
        res.status(200).json({ confirmed: 1 });
        return;
    } else {
        res.status(200).json({ confirmed: 0 });
        return;
    }
};
const postFetchOrders = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {};
export default {
    postAddOrder,
    postFetchOrdersByUser,
    postCheckIfUserPurchase,
    postFetchOrders,
};
