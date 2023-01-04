import Sequelize, { Model } from "sequelize";
import sequelize from "../utils/database";
class Dislikes extends Model {
    declare id?: number;
    declare UserId?: number;
    declare CommentId: number;
}

Dislikes.init(
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
export default Dislikes;
