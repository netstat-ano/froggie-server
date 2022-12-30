import Sequelize, { Model } from "sequelize";
import sequelize from "../utils/database";
class Comment extends Model {
    declare id?: number;
    declare commentText: string;
    declare rate: number;
    declare confirmedByPurchase: boolean;
}
Comment.init(
    {
        id: {
            allowNull: false,
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        commentText: {
            allowNull: false,
            type: Sequelize.TEXT,
        },
        rate: {
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        confirmedByPurchase: {
            allowNull: false,
            type: Sequelize.BOOLEAN,
        },
    },
    {
        sequelize,
        timestamps: false,
    }
);
export default Comment;
