import { FastifyInstance, RouteShorthandOptions } from "fastify";

export async function userRoutes(fastify: FastifyInstance) {
  const userGetOpts: RouteShorthandOptions = {
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
  fastify.get("/user", userGetOpts, async (_request, _reply) => {
    return { up: true };
  });
  const newUserPostOpts: RouteShorthandOptions = {
    schema: {
      body: {
        type: "object",
        additionalProperties: false,
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
          },
          password: {
            type: "string",
          },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            test: {
              type: "string",
            },
          },
        },
      },
    },
  };
  fastify.post("/user", newUserPostOpts, async (request, reply) => {
    const { body: user } = request;
    console.log(user);
    return { test: "test" };
  });
}
