import { Sequelize } from "sequelize";
const sequelize = new Sequelize("froggie", "root", "root", {
    dialect: "mysql",
    host: "localhost",
});
export default sequelize;
