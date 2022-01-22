import { Sequelize } from "sequelize-typescript";
const localhost = "localhost";
const standard = "postgres";

export const sequelize = new Sequelize({
  dialect: standard,
  host: process.env.HOST ? process.env.HOST : localhost,
  database: process.env.DATABASE ?? standard,
  username: process.env.DATABASE_USER ?? standard,
  password: process.env.DATABASE_PASSWORD ?? standard,
  models: [],
  ssl: false,
  pool: {
    max: parseInt(process.env.DATABASE_POOL_MAX ?? "10"),
    min: parseInt(process.env.DATABASE_POOL_MIN ?? "0"),
    idle: parseInt(process.env.DATABASE_POOL_IDLE ?? "5000"),
    acquire: parseInt(process.env.DATABASE_POOL_ACQUIRE ?? "20000"),
  },
});
