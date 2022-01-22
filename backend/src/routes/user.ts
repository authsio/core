import { FastifyInstance, RouteShorthandOptions } from "fastify";

export async function userRoutes(fastify: FastifyInstance) {
  const opts: RouteShorthandOptions = {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            up: {
              type: "string",
            },
          },
        },
      },
    },
  };
  fastify.get("/user", opts, async (_request, _reply) => {
    return { up: true };
  });
}
