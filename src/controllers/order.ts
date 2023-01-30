import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import { NextFunction, Request, Response } from "express";
import sequelize from "../utils/database";
import CartItems from "../models/CartItems";
import { validationResult } from "express-validator";
import Order from "../models/Order";
import socket from "../socket";
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
            "INSERT INTO orders(UserId, name, surname, grade, completed, canceled, locker, classroom) VALUES(:UserId, :name, :surname, :grade, 0, 0, :locker, :classroom)",
            {
                replacements: {
                    UserId: req.userId,
                    name: req.body.name,
                    surname: req.body.surname,
                    grade: req.body.grade,
                    locker: req.body.locker || null,
                    classroom: req.body.classroom || null,
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
                `SELECT orderitems.amount, products.name, orders.name as customerName, orders.surname as customerSurname, orders.grade,
                 products.imagesURL, products.CategoryId, products.price, products.description, orders.locker, orders.classroom, orderitems.OrderId, orders.createdAt  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE orders.UserId = :UserId
            AND completed = 0 AND canceled = 0;
            `,
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );
        } else {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, orders.name as customerName, orders.locker, orders.classroom, orders.surname as customerSurname,orders.grade, products.imagesURL, products.CategoryId, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
                JOIN products on orderitems.ProductId = products.id
                JOIN orders on orders.id = orderitems.OrderId
                WHERE orders.UserId = :UserId
                AND completed = 0 AND canceled = 0
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
) => {
    try {
        if (!req.body.sort) {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, orders.UserId , completed, canceled, orders.name as customerName, orders.surname as customerSurname, 
              orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE completed = 0 AND canceled = 0`,
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );
        } else {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, orders.UserId , canceled, orders.name as customerName, orders.surname as customerSurname, 
               orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
                JOIN products on orderitems.ProductId = products.id
                JOIN orders on orders.id = orderitems.OrderId
                WHERE completed = 0 AND canceled = 0
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
const postCompleteOrder = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const order = await Order.findByPk(req.body.id);
    if (order) {
        order.canceled = 0;
        order.completed = 1;
        await order.save();
        const io = socket.getIo();
        io.emit("order", { action: "change", UserId: order.UserId });
        res.status(200).json({
            message: "Order marked as completed",
            ok: true,
        });
        return;
    }
    res.status(404).json({ message: "Order not found", ok: false });
};
const postUncompleteOrder = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const order = await Order.findByPk(req.body.id);
    if (order) {
        order.canceled = 0;
        order.completed = 0;
        await order.save();
        const io = socket.getIo();
        io.emit("order", { action: "change", UserId: order.UserId });
        res.status(200).json({
            message: "Order marked as completed",
            ok: true,
        });
        return;
    }
    res.status(404).json({ message: "Order not found", ok: false });
};
const postCancelOrder = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const order = await Order.findByPk(req.body.id);
    if (order) {
        order.canceled = 1;
        order.completed = 0;
        await order.save();
        const io = socket.getIo();
        io.emit("order", { action: "change", UserId: order.UserId });
        res.status(200).json({
            message: "Order marked as canceled",
            ok: true,
        });
        return;
    }
    res.status(404).json({ message: "Order not found", ok: false });
};
const postFetchCompletedOrders = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body.sort) {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, orders.UserId , completed, canceled ,orders.name as customerName, orders.surname as customerSurname, 
               orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE completed = 1`,
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );
        } else {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, orders.UserId , completed, canceled ,orders.name as customerName, orders.surname as customerSurname,
                 orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
                JOIN products on orderitems.ProductId = products.id
                JOIN orders on orders.id = orderitems.OrderId
                WHERE completed = 1
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
const postFetchUncompletedOrders = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body.sort) {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, orders.UserId , completed, canceled, orders.name as customerName, orders.surname as customerSurname, 
                orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE completed = 0 AND canceled = 0`,
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );
        } else {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, orders.UserId , canceled, orders.name as customerName, orders.surname as customerSurname, 
                orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
                JOIN products on orderitems.ProductId = products.id
                JOIN orders on orders.id = orderitems.OrderId
                WHERE completed = 0 AND canceled = 0
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
const postFetchCanceledOrders = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body.sort) {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, orders.UserId , canceled, orders.name as customerName, orders.surname as customerSurname, 
                orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE canceled = 1`
            );
        } else {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, orders.UserId , canceled, orders.name as customerName, orders.surname as customerSurname, 
               orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
                JOIN products on orderitems.ProductId = products.id
                JOIN orders on orders.id = orderitems.OrderId
                WHERE canceled = 1
                ORDER BY ${req.body.sort}`
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

const postFetchCanceledOrdersByUserId = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body.sort) {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, canceled, orders.name as customerName, orders.surname as customerSurname, 
                orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE canceled = 1 AND orders.UserId = :UserId`,
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );
        } else {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, canceled, orders.name as customerName, orders.surname as customerSurname, 
               orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
                JOIN products on orderitems.ProductId = products.id
                JOIN orders on orders.id = orderitems.OrderId
                WHERE canceled = 1 AND orders.UserId = :UserId
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

const postFetchCompletedOrdersByUserId = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body.sort) {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, canceled, orders.name as customerName, orders.surname as customerSurname,
                 orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE completed = 1 AND orders.UserId = :UserId`,
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );
        } else {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, canceled, orders.name as customerName, orders.surname as customerSurname, 
              orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
                JOIN products on orderitems.ProductId = products.id
                JOIN orders on orders.id = orderitems.OrderId
                WHERE completed = 1 AND orders.UserId = :UserId
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
const postFetchUncompletedOrdersByUserId = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body.sort) {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, canceled, orders.name as customerName, orders.surname as customerSurname, 
                orders.grade, products.imagesURL, products.CategoryId, orders.locker, orders.classroom, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
            JOIN products on orderitems.ProductId = products.id
            JOIN orders on orders.id = orderitems.OrderId
            WHERE completed = 0 AND canceled = 0 AND orders.UserId = :UserId`,
                {
                    replacements: {
                        UserId: req.userId,
                    },
                }
            );
        } else {
            var [orders, meta] = await sequelize.query(
                `SELECT orderitems.amount, products.name, completed, orders.locker, orders.classroom, canceled, orders.name as customerName, orders.surname as customerSurname, orders.address, orders.postalCode, orders.city, products.imagesURL, products.CategoryId, products.price, products.description, orderitems.OrderId, orders.createdAt  FROM orderitems
                JOIN products on orderitems.ProductId = products.id
                JOIN orders on orders.id = orderitems.OrderId
                WHERE completed = 0 AND canceled = 0 AND orders.UserId = :UserId
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

export default {
    postAddOrder,
    postFetchOrdersByUser,
    postCheckIfUserPurchase,
    postFetchOrders,
    postCancelOrder,
    postUncompleteOrder,
    postCompleteOrder,
    postFetchCanceledOrders,
    postFetchCompletedOrders,
    postFetchCanceledOrdersByUserId,
    postFetchCompletedOrdersByUserId,
    postFetchUncompletedOrders,
    postFetchUncompletedOrdersByUserId,
};
