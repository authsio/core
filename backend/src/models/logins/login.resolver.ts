import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../..";
import { LoginInput, RegisterInput } from "./login.inputs";
import { Login, Token } from "./login.type";
import { Sequelize } from "sequelize-typescript";
import { User } from "../users/user.type";
import jwt from "jsonwebtoken";
import { Key } from "../keys/key.type";
import { Project } from "../projects/project.type";

async function generateJWT(
  db: Sequelize,
  schema: string,
  email: string,
  jwtSecret: string
): Promise<string> {
  const user = (await db.models.User.schema(schema).findOne({
    where: {
      email,
    },
    raw: true,
  })) as User;
  return jwt.sign({ ...user, projectId: schema }, jwtSecret, {
    expiresIn: "1h",
  });
}

@Resolver(() => Login)
export class LoginResolver {
  standardError = {
    token: null,
    message: "INTERNAL ERROR",
  };
  @Mutation(() => Token)
  async refreshToken(
    @Ctx() { sequelize, decryptedToken }: Context
  ): Promise<Token> {
    if (!sequelize || !decryptedToken?.key) {
      return this.standardError;
    }
    const findKey = (await sequelize.models.Key.findOne({
      where: {
        key: decryptedToken.key,
      },
    })) as Key;
    if (!findKey) {
      return this.standardError;
    }
    const schema = findKey.parentProjectId;
    const newSchema = findKey.projectId;
    const project = (await sequelize.models.Project.schema(schema).findOne({
      where: {
        projectId: schema,
      },
    })) as Project;
    const jwt = await generateJWT(
      sequelize,
      newSchema,
      decryptedToken.token.email,
      project.jwtSigningSecret
    );
    return jwt ? { token: jwt, message: "SUCCESS" } : this.standardError;
  }

  @Mutation(() => Token)
  async register(
    @Arg("data", () => RegisterInput)
    { firstName, lastName, email, password }: RegisterInput,
    @Ctx() { sequelize, decryptedToken }: Context
  ): Promise<Token> {
    if (!sequelize || !decryptedToken?.key) {
      return this.standardError;
    }
    const findKey = (await sequelize.models.Key.findOne({
      where: {
        key: decryptedToken.key,
      },
    })) as Key;
    if (!findKey) {
      return this.standardError;
    }
    const schema = findKey.parentProjectId;
    const newSchema = findKey.projectId;
    if (!schema) {
      return this.standardError;
    }
    const userAccount = (await sequelize.models.User.schema(newSchema).create({
      email,
      firstName,
      lastName,
    })) as User;
    // MAGIC UNDER THE HOOD HASHED PASSWORDS
    await sequelize.models.Login.schema(newSchema).create({
      email,
      passwordHash: password,
      userId: userAccount.id,
    });
    const project = (await sequelize.models.Project.schema(schema).findOne({
      where: {
        projectId: schema,
      },
    })) as Project;
    const jwt = await generateJWT(
      sequelize,
      newSchema,
      userAccount.email,
      project.jwtSigningSecret
    );
    return jwt
      ? {
          token: jwt,
          message: "SUCCESS",
        }
      : this.standardError;
  }

  @Query(() => Token)
  async login(
    // will need to use the public key from the LoginInput here to determine the schema
    // Or do we read the requesting user owner api key also?
    @Arg("data", () => LoginInput) { email, password }: LoginInput,
    @Ctx() { sequelize, decryptedToken }: Context
  ): Promise<Token> {
    if (!sequelize || !decryptedToken?.key) {
      return this.standardError;
    }
    const findKey = (await sequelize.models.Key.findOne({
      where: {
        key: decryptedToken.key,
      },
    })) as Key;
    if (!findKey) {
      return this.standardError;
    }
    const schema = findKey.parentProjectId;
    const newSchema = findKey.projectId;
    if (!schema) {
      return this.standardError;
    }
    const loginInfo = (await sequelize.models.Login.schema(newSchema).findOne({
      where: {
        email,
      },
    })) as Login | null;
    if (!loginInfo) {
      return this.standardError;
    }
    const passwordMatch = loginInfo.passwordMatch(password);
    if (!passwordMatch) {
      return this.standardError;
    }
    // TODO: How to find the init project where the schema and ID will not match....
    // We need this so we can get the jwtSigningSecret
    // We could for now not use this column but ideal world we need this to keep JWT on their own code
    const project = (await sequelize.models.Project.schema(schema).findOne({
      where: {
        projectId: schema,
      },
    })) as Project;
    const jwt = await generateJWT(
      sequelize,
      newSchema,
      email,
      project.jwtSigningSecret
    );
    return jwt
      ? {
          token: jwt,
          message: "SUCCESS",
        }
      : this.standardError;
  }
}
