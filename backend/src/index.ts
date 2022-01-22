import Fastify, { FastifyInstance, RouteShorthandOptions } from "fastify";
import { uptime } from "./routes/uptime";
import { userRoutes } from "./routes/user";

const server: FastifyInstance = Fastify({
  logger: true,
});
const PORT = process.env.PORT ?? 4000;

server.register(userRoutes);
server.register(uptime);

const start = async () => {
  try {
    await server.listen(PORT);

    const address = server.server.address();
    const port = typeof address === "string" ? address : address?.port;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
