import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config({ debug: false });
import { ApolloServer } from "apollo-server";
import * as path from "path";
import { buildSchema } from "type-graphql";
import { Sequelize } from "sequelize-typescript";
import { sequelize } from "./libs/db";

const PORT = process.env.PORT ?? 4000;

interface MainContext {
  sequelize: Sequelize;
}

export type Context = Readonly<MainContext>;

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
    context: async (_intContext): Promise<Context> => ({
      sequelize,
    }),
  });

  // Start the server
  const { url } = await server.listen(PORT);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
