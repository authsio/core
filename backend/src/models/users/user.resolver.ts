import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Context } from "../..";
import { BootstrapNewAccountInput } from "./user.input";
import { BootstrapProject, User } from "./user.type";
import { v4 as uuidv4 } from "uuid";
import { publicTables } from "../../libs/db";
import { KEY_TYPE } from "../enums/key-types";
import { generateNewKey } from "../../utils/generate-key-pair";
import { hashNewPassword } from "../../utils/hash-new-password";

const doNotTouchSchemas = [
  "pg_toast",
  "pg_catalog",
  "public",
  "information_schema",
];

@Resolver(() => User)
export class UserResolver {
  @Mutation(() => Boolean, {
    description:
      "This can only be used to bootstrap the project and reject calls after the initial setup",
  })
  async bootstrap(
    @Arg("data")
    { firstName, lastName, email, password }: BootstrapNewAccountInput,
    @Ctx() { sequelize }: Context
  ): Promise<BootstrapProject | null> {
    const [results, metadata] = (await sequelize.query(
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
    const schema = uuidv4();
    try {
      await sequelize.createSchema(schema, {});
      // Postgres might not have this extension by default
      await sequelize.query("CREATE EXTENSION IF NOT EXISTS citext;");
      await sequelize.sync({ schema });
      await Promise.all(
        publicTables.map((dbModel) =>
          sequelize.query(
            `DROP TABLE IF EXISTS "${schema}"."${dbModel.getTableName()}";`
          )
        )
      );
    } catch (error) {
      console.log(error);
    }
    // These are not real public and private keys but more permissions
    // That we are going to store and use for different queries and ensure no leaking data
    const publicKey = generateNewKey();
    const privateKey = generateNewKey();
    const keys = [
      {
        keyType: KEY_TYPE.PUBLIC,
        projectId: schema,
        key: publicKey,
      },
      {
        keyType: KEY_TYPE.PRIVATE,
        projectId: schema,
        key: privateKey,
      },
    ];
    // TODO: Could use a promise all & or a transaction and clean this up
    const createdKeys = await sequelize.models.Key.bulkCreate(keys);
    const userAccount = (await sequelize.models.User.schema(schema).create({
      email,
      firstName,
      lastName,
    })) as User;
    const { hashedPassword, salt } = hashNewPassword(password);
    const userLogin = await sequelize.models.Login.schema(schema).create({
      email,
      passwordSalt: salt,
      passwordHash: hashedPassword,
      userId: userAccount.id,
    });
    if (createdKeys && userAccount && userLogin) {
      return {
        publicKey,
        privateKey,
        projectId: schema,
      };
    }
    return null;
  }
}
