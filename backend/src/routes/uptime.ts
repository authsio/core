import { FastifyInstance, RouteShorthandOptions } from "fastify";

export async function uptime(fastify: FastifyInstance) {
  const pingGetOpts: RouteShorthandOptions = {
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
  fastify.get("/ping", pingGetOpts, async (_request, _reply) => {
    return { up: true };
  });
}
