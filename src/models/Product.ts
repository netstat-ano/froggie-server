import sequelize from "../utils/database";
import User from "./User";
import Category from "./Category";
import Sequelize, {
    Model,
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    HasManyAddAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManySetAssociationsMixin,
    HasManyAddAssociationsMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    ModelDefined,
    Association,
    Optional,
    NonAttribute,
    ForeignKey,
} from "sequelize";

class Product extends Model {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare imagesURL: string;
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
            type: Sequelize.STRING,
            allowNull: false,
        },
        imagesURL: {
            type: Sequelize.JSON,
            allowNull: false,
        },
    },
    {
        tableName: "products",
        sequelize,
    }
);
export default Product;
