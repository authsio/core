import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../..";
import { publicTables } from "../../libs/db";
import { generateNewKey } from "../../utils/generate-key-pair";
import { KEY_TYPE } from "../enums/key-types";
import { Key } from "../keys/key.type";
import { BootstrapProject, User } from "../users/user.type";
import { Project } from "./project.type";

@Resolver(() => Project)
export class ProjectResolver {
  // TODO: Still need to flush out the logic here, it might be missing something...
  @Mutation(() => BootstrapProject, { nullable: true })
  async createProject(
    @Arg("projectName") projectName: string,
    @Ctx() { decryptedToken, sequelize }: Context
  ): Promise<BootstrapProject | null> {
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
    // NOTE: Maybe we should ensure this is a private key for this action?
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
    if (!user) {
      return null;
    }
    const newSchema = `auth_${generateNewKey()}`;
    await sequelize.createSchema(newSchema, {});
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS citext;");
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await sequelize.sync({ schema: newSchema });
    await Promise.all(
      publicTables.map((dbModel) =>
        sequelize.query(
          `DROP TABLE IF EXISTS "${newSchema}"."${dbModel.getTableName()}";`
        )
      )
    );
    const publicKey = generateNewKey();
    const privateKey = generateNewKey();
    const keys = [
      {
        keyType: KEY_TYPE.PUBLIC,
        projectId: newSchema,
        key: publicKey,
      },
      {
        keyType: KEY_TYPE.PRIVATE,
        projectId: newSchema,
        key: privateKey,
      },
    ];
    const createdKeys = await sequelize.models.Key.bulkCreate(keys);
    const project = (await sequelize.models.Project.schema(schema).create({
      projectId: newSchema,
      name: projectName,
      jwtSigningSecret: generateNewKey(),
      userId: user.id,
    })) as Project;
    if (createdKeys.length && project) {
      return {
        publicKey,
        privateKey,
        projectId: newSchema,
      };
    }
    return null;
  }
  @Query(() => Project)
  async readProjects(): Promise<Project[]> {
    return [];
  }

  @Query(() => Project)
  async readProject(
    @Arg("projectId") projectId: string
  ): Promise<Project | null> {
    console.log(projectId);
    return null;
  }

  @Mutation(() => Project)
  async editProject(
    @Arg("projectName") projectName: string
  ): Promise<Project | null> {
    console.log(projectName);
    return null;
  }

  @Mutation(() => Project)
  // NOTES: Takes an array of projectIds and deletes everything
  // Schema & Keys
  async deleteProjects(): Promise<boolean> {
    return false;
  }
}
