import sequelize from "../utils/database";
const CartItems = sequelize.define(
    "cartitems",
    {},
    {
        timestamps: false,
    }
);
export default CartItems;
