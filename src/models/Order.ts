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
    },
    {
        tableName: "orders",
        timestamps: false,
        sequelize,
    }
);
export default Order;
