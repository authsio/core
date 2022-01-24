import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config({ debug: false });
import { ApolloServer } from "apollo-server";
import * as path from "path";
import { buildSchema } from "type-graphql";
import { Sequelize } from "sequelize-typescript";
import { sequelize } from "./libs/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import { decode } from "punycode";
import { Project } from "./models/projects/project.type";

const PORT = process.env.PORT ?? 4000;
// TODO: This should be a public key or secret set for each user.
// NOTE: This means that each user's users should have their own key
// NOTE: How will we determine what secret to use?
export const JWT_SECRET = process.env.JWT_SECRET ?? "test";

interface MainContext {
  sequelize: Sequelize;
  decryptedToken: string | null | JwtPayload;
}

export type Context = Readonly<MainContext>;

async function decryptAndVerifyToken(
  headers: {
    authorization?: string;
  },
  db: Sequelize
): Promise<string | null | JwtPayload> {
  if (!headers?.authorization) {
    return null;
  }
  const rawToken = headers.authorization.split(" ")[1];
  if (!rawToken) {
    throw new Error("Please use standard Bearer token format");
  }
  const decoded = jwt.decode(rawToken);
  if (!decoded || decoded === typeof "string") {
    throw new Error("Please use standard Bearer token format for decode");
  }
  const { payload } = decoded as JwtPayload;
  // This might not be correct, bc we might be on the wrong schema here
  // We might need to use the projectId as the schema also
  // db.models.Project.schema(payload.projectId).findOne
  // TODO: Flush this out
  const project = (await db.models.Project.findOne({
    where: {
      id: payload.projectId,
    },
  })) as Project;
  if (!project) {
    throw new Error("Can not find user project");
  }
  try {
    // Take the project signing secret to verify the token
    const token = jwt.verify(rawToken, project.jwtSigningSecret);
    return token ? token : null;
  } catch (error) {
    throw new Error(`Error with token: ${error}`);
  }
}

async function bootstrap() {
  await sequelize.authenticate();
  if (process.env.DATABASE_FORCE_SYNC === "yes") {
    await sequelize.sync();
  }
  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [__dirname + "/**/*.resolver.{ts,js}"],
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
  });

  // Create GraphQL server
  const server = new ApolloServer({
    schema,
    context: async (integrationContext): Promise<Context> => ({
      sequelize,
      decryptedToken: await decryptAndVerifyToken(
        integrationContext.req.headers,
        sequelize
      ),
    }),
  });

  // Start the server
  const { url } = await server.listen(PORT);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
