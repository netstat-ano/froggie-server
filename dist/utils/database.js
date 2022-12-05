"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize("froggie", "root", "root", {
    dialect: "mysql",
    host: "localhost",
});
exports.default = sequelize;
