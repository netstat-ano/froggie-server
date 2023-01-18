import { NextFunction, Response } from "express";
import AuthenticationRequest from "../interfaces/AuthenticationRequest";
import Notification from "../models/Notification";
import sequelize from "../utils/database";
import socket from "../socket";
const postAddNotification = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const [result] = await sequelize.query(
            "INSERT INTO notifications(UserId, message) VALUES(:UserId, :message)",
            {
                replacements: {
                    UserId: req.body.UserId,
                    message: req.body.message,
                },
            }
        );
        const io = socket.getIo();
        io.emit("notification", { action: "create", UserId: req.body.UserId });
        res.status(201).json({ message: "Notification created", ok: true });
    } catch (err) {
        next(err);
    }
};
const postFetchNotificationsByUser = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const notifications = await Notification.findAll({
        where: {
            UserId: req.userId,
        },
        order: [["createdAt", "DESC"]],
    });
    if (notifications) {
        res.status(200).json({ notifications, ok: true });
        return;
    }
    res.status(404).json({ message: "Notification not founded", ok: false });
};
const postFetchUnseenNotificationsByUser = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    const notifications = await Notification.findAll({
        where: {
            UserId: req.userId,
            seen: 0,
        },
        order: [["createdAt", "DESC"]],
    });
    if (notifications) {
        res.status(200).json({ notifications, ok: true });
        return;
    }
    res.status(404).json({ message: "Notification not founded", ok: false });
};
const postMarkNotificationsAsSeen = async (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        await sequelize.query(
            "UPDATE notifications SET seen = 1 WHERE UserId = :UserId",
            {
                replacements: {
                    UserId: req.userId,
                },
            }
        );
        res.status(201).json({ message: "Notification created", ok: true });
    } catch (err) {
        next(err);
    }
};
export default {
    postAddNotification,
    postFetchNotificationsByUser,
    postMarkNotificationsAsSeen,
    postFetchUnseenNotificationsByUser,
};
