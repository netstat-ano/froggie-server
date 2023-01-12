import sequelize from "../utils/database";
import Sequelize, { Model } from "sequelize";
class Order extends Model {
    declare id?: number;
    declare name: string;
    declare surname: string;
    declare address: string;
    declare postalCode: string;
    declare city: string;
    declare completed: number;
    declare canceled: number;
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
        address: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        postalCode: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false,
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
