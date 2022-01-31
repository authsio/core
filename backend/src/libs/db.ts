import { Sequelize, ModelCtor, Model } from "sequelize-typescript";
import { Key } from "../models/keys/key.type";
import { Login } from "../models/logins/login.type";
import { Project } from "../models/projects/project.type";
import { User } from "../models/users/user.type";

const localhost = "localhost";
const standard = "postgres";

export const publicTables: ModelCtor<Model<any, any>>[] = [Key];
export const privateTables: ModelCtor<Model<any, any>>[] = [
  Login,
  Project,
  User,
];

export const sequelize = new Sequelize({
  dialect: standard,
  host: process.env.HOST ? process.env.HOST : localhost,
  database: process.env.DATABASE ?? standard,
  username: process.env.DATABASE_USER ?? standard,
  password: process.env.DATABASE_PASSWORD ?? standard,
  models: [...publicTables, ...privateTables],
  ssl: false,
  pool: {
    max: parseInt(process.env.DATABASE_POOL_MAX ?? "10"),
    min: parseInt(process.env.DATABASE_POOL_MIN ?? "0"),
    idle: parseInt(process.env.DATABASE_POOL_IDLE ?? "5000"),
    acquire: parseInt(process.env.DATABASE_POOL_ACQUIRE ?? "20000"),
  },
});
