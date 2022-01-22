import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { Context, JWT_SECRET } from "../..";
import { LoginInput } from "./login.inputs";
import { Login, Token } from "./login.type";
import crypto from "crypto";
import { Sequelize } from "sequelize-typescript";
import { User } from "../users/user.type";
import jwt from "jsonwebtoken";

function doesPasswordMatch(password: string, loginInfo: Login): boolean {
  crypto.pbkdf2(
    password,
    loginInfo.passwordSalt,
    3600,
    25,
    "sha256",
    (err, hashedPassword) => {
      if (err) {
        return false;
      }
      if (
        !crypto.timingSafeEqual(
          loginInfo.passwordHash as unknown as NodeJS.ArrayBufferView,
          hashedPassword
        )
      ) {
        return false;
      }
      return true;
    }
  );
  return false;
}

async function generateJWT(db: Sequelize, userName: string): Promise<string> {
  const user = (await db.models.User.findOne({
    where: {
      userName,
    },
  })) as User;
  return jwt.sign({ ...user }, JWT_SECRET, { expiresIn: "1h" });
}

@Resolver(() => Login)
export class LoginResolver {
  @Query(() => Token)
  async login(
    @Arg("data", () => LoginInput) { userName, password }: LoginInput,
    @Ctx() { sequelize }: Context
  ): Promise<Token> {
    const standardError = {
      token: null,
      message: "INTERNAL ERROR",
    };
    if (!sequelize) {
      return standardError;
    }
    const loginInfo = (await sequelize.models.Login.findOne({
      where: {
        userName,
      },
    })) as Login | null;
    if (!loginInfo) {
      return standardError;
    }
    const passwordMatch = doesPasswordMatch(password, loginInfo);
    if (!passwordMatch) {
      return standardError;
    }
    const jwt = await generateJWT(sequelize, userName);
    return jwt
      ? {
          token: jwt,
          message: "SUCCESS",
        }
      : standardError;
  }
}
