import sequelize from "../utils/database";
import Product from "./Product";
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
class User extends Model<
    InferAttributes<User, { omit: "products" }>,
    InferCreationAttributes<User, { omit: "products" }>
> {
    declare id: CreationOptional<number>;
    declare username: string;
    declare email: string;
    declare password: string;
    declare type: string;

    declare getProjects: HasManyGetAssociationsMixin<Product>;
    declare addProject: HasManyAddAssociationMixin<Product, number>;
    declare addProjects: HasManyAddAssociationsMixin<Product, number>;
    declare setProjects: HasManySetAssociationsMixin<Product, number>;
    declare removeProject: HasManyRemoveAssociationMixin<Product, number>;
    declare removeProjects: HasManyRemoveAssociationsMixin<Product, number>;
    declare hasProject: HasManyHasAssociationMixin<Product, number>;
    declare hasProjects: HasManyHasAssociationsMixin<Product, number>;
    declare countProjects: HasManyCountAssociationsMixin;
    declare createProduct: HasManyCreateAssociationMixin<Product, "UserId">;
    declare products?: NonAttribute<Product[]>;

    declare static associations: {
        products: Association<User, Product>;
    };
}

User.init(
    {
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "users",
        sequelize,
    }
);
export default User;
