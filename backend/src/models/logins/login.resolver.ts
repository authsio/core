import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context, JWT_SECRET } from "../..";
import { LoginInput, RegisterInput } from "./login.inputs";
import { Login, Token } from "./login.type";
import { Sequelize } from "sequelize-typescript";
import { User } from "../users/user.type";
import jwt from "jsonwebtoken";
import { doesPasswordMatch } from "../../utils/does-password-match";

async function generateJWT(db: Sequelize, email: string): Promise<string> {
  const user = (await db.models.User.findOne({
    where: {
      email,
    },
  })) as User;
  return jwt.sign({ ...user }, JWT_SECRET, { expiresIn: "1h" });
}

@Resolver(() => Login)
export class LoginResolver {
  standardError = {
    token: null,
    message: "INTERNAL ERROR",
  };

  @Mutation(() => Token)
  async register(
    @Arg("data", () => RegisterInput) data: RegisterInput,
    @Ctx() { sequelize }: Context
  ): Promise<Token> {
    if (!sequelize) {
      return this.standardError;
    }
    console.log({ data });
    return this.standardError;
  }

  @Query(() => Token)
  async login(
    // will need to use the public key from the LoginInput here to determine the schema
    // Or do we read the requesting user owner api key also?
    @Arg("data", () => LoginInput) { email, password }: LoginInput,
    @Ctx() { sequelize }: Context
  ): Promise<Token> {
    if (!sequelize) {
      return this.standardError;
    }
    const loginInfo = (await sequelize.models.Login.findOne({
      where: {
        email,
      },
    })) as Login | null;
    if (!loginInfo) {
      return this.standardError;
    }
    const passwordMatch = doesPasswordMatch(password, loginInfo);
    if (!passwordMatch) {
      return this.standardError;
    }
    const jwt = await generateJWT(sequelize, email);
    return jwt
      ? {
          token: jwt,
          message: "SUCCESS",
        }
      : this.standardError;
  }
}
