import express from "express";
import isAdminAuth from "../middlewares/is-admin-auth";
import notificationController from "../controllers/notification";
import isAuth from "../middlewares/is-auth";
const notificationRoutes = express.Router();

notificationRoutes.post(
    "/add-notification",
    isAdminAuth,
    notificationController.postAddNotification
);
notificationRoutes.post(
    "/fetch-notification-by-user",
    isAuth,
    notificationController.postFetchNotificationsByUser
);
notificationRoutes.post(
    "/mark-notifications-as-seen",
    isAuth,
    notificationController.postMarkNotificationsAsSeen
);
notificationRoutes.post(
    "/fetch-unseen-notification-by-user",
    isAuth,
    notificationController.postMarkNotificationsAsSeen
);
export default notificationRoutes;
