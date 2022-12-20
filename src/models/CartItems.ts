import sequelize from "../utils/database";
import { DataTypes } from "sequelize";
import { Model, ForeignKey } from "sequelize";
import Cart from "./Cart";
import Product from "./Product";
class CartItems extends Model {
    declare id?: number;

    declare amount: number;
}
CartItems.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        amount: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        timestamps: false,
    }
);
export default CartItems;
