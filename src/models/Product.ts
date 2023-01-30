import sequelize from "../utils/database";
import User from "./User";
import Category from "./Category";
import Sequelize, {
    Model,
    CreationOptional,
    NonAttribute,
    ForeignKey,
} from "sequelize";

class Product extends Model {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare imagesURL: string;
    declare price: number;
    declare UserId: ForeignKey<User["id"]>;
    declare CategoryId: ForeignKey<Category["id"]>;
    declare user?: NonAttribute<User>;
}
Product.init(
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
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        imagesURL: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
    },
    {
        tableName: "products",
        sequelize,
        timestamps: false,
    }
);
export default Product;
