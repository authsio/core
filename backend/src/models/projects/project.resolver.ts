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
    const schema = foundKey.parentProjectId;
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
        parentProjectId: schema,
        key: publicKey,
      },
      {
        keyType: KEY_TYPE.PRIVATE,
        projectId: newSchema,
        parentProjectId: schema,
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
  @Query(() => [Project], { nullable: true })
  async readProjects(
    @Arg("projectIds", () => [String]) ids: string[],
    @Ctx() { decryptedToken, sequelize }: Context
  ): Promise<Project[] | null> {
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
    const projects = (await sequelize.models.Project.schema(schema).findAll({
      where: {
        id: ids,
        userId: decryptedToken.token.id,
      },
    })) as Project[];
    return projects.length ? projects : [];
  }

  @Query(() => Project, { nullable: true })
  async readProject(
    @Arg("projectId") projectId: string,
    @Ctx() { decryptedToken, sequelize }: Context
  ): Promise<Project | null> {
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
    const project = (await sequelize.models.Project.schema(schema).findOne({
      where: {
        id: projectId,
        userId: decryptedToken.token.id,
      },
    })) as Project;
    return project ? project : null;
  }

  @Mutation(() => Project, { nullable: true })
  async editProject(
    @Arg("projectName") projectName: string,
    @Arg("projectId") projectId: string,
    @Ctx() { decryptedToken, sequelize }: Context
  ): Promise<Project | null> {
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
    const [_count, projects] = (await sequelize.models.Project.schema(
      schema
    ).update(
      {
        name: projectName,
      },
      {
        where: { id: projectId, userId: decryptedToken.token.id },
        returning: true,
      }
    )) as [number, Project[]];
    if (projects.length === 1) {
      return {
        ...projects[0],
        id: projectId,
      } as Project;
    }
    return null;
  }

  @Mutation(() => Boolean)
  // NOTES: Takes an array of projectIds and deletes everything
  // Schema & Keys
  async deleteProjects(
    @Arg("projectIds", () => [String]) ids: string[],
    @Ctx() { decryptedToken, sequelize }: Context
  ): Promise<boolean> {
    if (!decryptedToken || typeof decryptedToken === "string") {
      return false;
    }
    if (!decryptedToken?.key || !decryptedToken?.token) {
      return false;
    }
    const foundKey = (await sequelize.models.Key.findOne({
      where: {
        key: decryptedToken.key,
      },
    })) as Key;
    if (!foundKey) {
      return false;
    }
    const schema = foundKey.projectId;
    if (!schema) {
      return false;
    }
    const projects = (await sequelize.models.Project.schema(schema).findAll({
      where: {
        id: ids,
      },
    })) as Project[];
    const checks = await Promise.all(
      projects.map(async (i) => {
        await sequelize.models.Key.destroy({
          where: {
            projectId: i.projectId,
          },
        });
        await sequelize.models.Project.schema(foundKey.parentProjectId).destroy(
          {
            where: {
              projectId: i.projectId,
            },
          }
        );
        await sequelize.query(`DROP SCHEMA IF EXISTS ${i.projectId} CASCADE`);
        return true;
      })
    );
    if (
      checks.length &&
      checks.length === projects.length &&
      checks.filter((i) => i === false).length === 0
    ) {
      return true;
    }
    return false;
  }
}
