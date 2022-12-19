import sequelize from "../utils/database";
import Sequelize, { Model, ForeignKey } from "sequelize";
import User from "./User";
class Cart extends Model {
    declare id?: number;
    declare UserId: ForeignKey<User["id"]>;
}

Cart.init(
    {
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        tableName: "carts",
        sequelize,
        timestamps: false,
    }
);
export default Cart;
