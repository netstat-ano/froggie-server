import sequelize from "../utils/database";
import Sequelize, { Model } from "sequelize";

class Categorie extends Model {
    declare id: number;
    declare name: string;
}

Categorie.init(
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
export default Categorie;
