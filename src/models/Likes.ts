import Sequelize, { Model } from "sequelize";
import sequelize from "../utils/database";
class Likes extends Model {
    declare id?: number;
    declare UserId?: number;
    declare CommentId: number;
}

Likes.init(
    {
        id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement: true,
        },
    },
    {
        sequelize,
        timestamps: false,
    }
);
export default Likes;
