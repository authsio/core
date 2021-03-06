import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Context } from "../..";
import { BootstrapNewAccountInput } from "./user.input";
import { BootstrapProject, User } from "./user.type";
import { publicTables } from "../../libs/db";
import { KEY_TYPE } from "../enums/key-types";
import { generateNewKey } from "../../utils/generate-key-pair";
import { Key } from "../keys/key.type";
import { Project } from "../projects/project.type";

const doNotTouchSchemas = [
  "pg_toast",
  "pg_catalog",
  "public",
  "information_schema",
];

@Resolver(() => User)
export class UserResolver {
  // Need to sort out permissions on this @Auth()
  // Assume we just want to confirm headers there
  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { decryptedToken, sequelize }: Context
  ): Promise<User | null> {
    if (!decryptedToken || typeof decryptedToken === "string") {
      return null;
    }
    if (!decryptedToken?.key || !decryptedToken?.token) {
      return null;
    }
    const foundKey = (await sequelize.models.Key.findOne({
      where: {
        key: decryptedToken.key,
      },
    })) as Key;
    if (!foundKey) {
      return null;
    }
    const schema = foundKey.projectId;
    if (!schema) {
      return null;
    }
    const user = (await sequelize.models.User.schema(schema).findOne({
      where: {
        id: decryptedToken.token.id,
      },
    })) as User;
    return user ? user : null;
  }

  @Mutation(() => BootstrapProject, {
    description:
      "This can only be used to bootstrap the initial project and will reject calls after the initial setup",
    nullable: true,
  })
  async bootstrap(
    @Arg("data")
    { firstName, lastName, email, password }: BootstrapNewAccountInput,
    @Ctx() { sequelize }: Context
  ): Promise<BootstrapProject | null> {
    const [results] = (await sequelize.query(
      "SELECT schema_name FROM information_schema.schemata"
    )) as [{ schema_name: string }[], any];
    // Filter postgres and public out
    const touchableSchemas = results.filter(
      (i) => !doNotTouchSchemas.includes(i.schema_name)
    );
    if (touchableSchemas.length) {
      return null;
    }
    // NOW WE HAVE ENSURED THAT NO OTHER SCHEMA ARE OUT THERE
    // THIS MEANS WE CAN BOOTSTRAP A NEW PROJECT
    // WE NEED TO FORCE THE FIRST SCHEMA UUID (name)
    const schema = `auth_${generateNewKey()}`;
    await sequelize.createSchema(schema, {});
    await sequelize.transaction(async (transaction) => {
      // Postgres might not have this extension by default
      await sequelize.query("CREATE EXTENSION IF NOT EXISTS citext;", {
        transaction,
      });
      await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`, {
        transaction,
      });
      // @ts-ignore
      await sequelize.sync({ schema, transaction });
      await Promise.all(
        publicTables.map((dbModel) =>
          sequelize.query(
            `DROP TABLE IF EXISTS "${schema}"."${dbModel.getTableName()}";`,
            { transaction }
          )
        )
      );
    });
    return sequelize.transaction(async (transaction) => {
      // These are not real public and private keys but more permissions
      // That we are going to store and use for different queries and ensure no leaking data
      const publicKey = generateNewKey();
      const privateKey = generateNewKey();
      const keys = [
        {
          keyType: KEY_TYPE.PUBLIC,
          projectId: schema,
          parentProjectId: schema,
          key: publicKey,
        },
        {
          keyType: KEY_TYPE.PRIVATE,
          projectId: schema,
          parentProjectId: schema,
          key: privateKey,
        },
      ];
      // TODO: Could use a promise all & or a transaction and clean this up
      const createdKeys = await sequelize.models.Key.bulkCreate(keys, {
        transaction,
      });
      const userAccount = (await sequelize.models.User.schema(schema).create(
        {
          email,
          firstName,
          lastName,
        },
        { transaction }
      )) as User;
      const project = (await sequelize.models.Project.schema(schema).create(
        {
          projectId: schema,
          name: "Base Project",
          jwtSigningSecret: generateNewKey(),
          userId: userAccount.id,
        },
        { transaction }
      )) as Project;
      // MAGIC UNDER THE HOOD HASHES THE PASSWORD
      const userLogin = await sequelize.models.Login.schema(schema).create(
        {
          email,
          passwordHash: password,
          userId: userAccount.id,
        },
        { transaction }
      );
      if (createdKeys.length && userAccount && userLogin && project) {
        return {
          publicKey,
          privateKey,
          projectId: schema,
        };
      }
      return null;
    });
  }

  @FieldResolver(() => [Project])
  async projects(
    @Root() user: User,
    @Ctx() { sequelize, decryptedToken }: Context
  ): Promise<Project[] | null> {
    if (!decryptedToken?.token?.projectId) {
      return null;
    }
    const projects = (await sequelize.models.Project.schema(
      decryptedToken.token.projectId
    ).findAll({
      where: {
        userId: user.id,
      },
      raw: true,
    })) as Project[];
    return projects;
  }
}
