import sequelize from "../utils/database";
import Sequelize, { Model } from "sequelize";
class Order extends Model {
    declare id?: number;
    declare UserId?: number;
    declare name: string;
    declare surname: string;
    declare grade: string;
    declare completed: number;
    declare canceled: number;
    declare classroom?: string;
    declare locker?: number;
}

Order.init(
    {
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        surname: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        grade: {
            type: Sequelize.STRING,
        },
        locker: {
            type: Sequelize.INTEGER,
        },
        classroom: {
            type: Sequelize.INTEGER,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal(
                "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
            ),
        },
        completed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        canceled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: "orders",
        timestamps: false,
        sequelize,
    }
);
export default Order;
