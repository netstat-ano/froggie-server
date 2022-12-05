import sequelize from "../utils/database";
import Sequelize, {
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
class User extends Model {
    declare id: number;
    declare username: string;
    declare email: string;
    declare password: string;
    declare type: string;
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
