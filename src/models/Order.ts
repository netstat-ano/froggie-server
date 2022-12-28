import sequelize from "../utils/database";
import Sequelize, { Model } from "sequelize";
class Order extends Model {
    declare id?: number;
}

Order.init(
    {
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
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
    },
    {
        tableName: "orders",
        timestamps: false,
        sequelize,
    }
);
export default Order;
