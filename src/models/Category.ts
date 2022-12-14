import sequelize from "../utils/database";
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
import Product from "./Product";
class Category extends Model {
    declare id?: number;
    declare name: string;
}

Category.init(
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
    },
    {
        tableName: "categories",
        sequelize,
    }
);
export default Category;
