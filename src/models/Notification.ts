import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../utils/database";

class Notification extends Model {
    declare id: number;
    declare UserId: number;
    declare message: string;
}

Notification.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        seen: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
    },
    { sequelize, timestamps: false }
);
export default Notification;
