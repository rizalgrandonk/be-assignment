import { fastify, FastifyInstance, FastifyRequest } from "fastify";
import {
  registerUser,
  loginUser,
  getAccounts,
  createAccount,
} from "../services/accountManager";
import { supabase } from "../services/supabaseClient";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/error";

export async function authenticate(request: FastifyRequest) {
  const token = request.headers.authorization?.split(" ")[1];

  if (!token) throw new ApiError(401, "Unauthorized");

  const { data, error } = await supabase.auth.getUser(token);
  const { user } = data;
  if (error || !user) throw new ApiError(401, "Unauthorized");

  if (!user.email) throw new ApiError(401, "Unauthorized");

  const localData = await prisma.user.upsert({
    where: {
      email: user.email,
    },
    update: {},
    create: {
      email: user.email,
    },
  });

  return { ...user, localData };
}

export async function accountRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    {
      schema: {
        description: "User register with Email and Password",
        tags: ["User"],
        summary: "Register",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Successful Register",
            type: "object",
            properties: {
              token: { type: "string" },
            },
          },
          401: {
            description: "Unauthorized",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          400: {
            description: "Failed Request",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };
      const user = await registerUser(email, password);
      reply.send(user);
    }
  );

  fastify.post(
    "/login",
    {
      schema: {
        description: "User login with Email and Password",
        tags: ["User"],
        summary: "Login",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Successful Login",
            type: "object",
            properties: {
              token: { type: "string" },
            },
          },
          401: {
            description: "Unauthorized",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          400: {
            description: "Failed Request",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };
      const token = await loginUser(email, password);
      reply.send({ token });
    }
  );

  fastify.get(
    "/accounts",
    {
      schema: {
        description: "Get User's Payment Accounts",
        tags: ["Payment Account"],
        summary: "Get Payment Accounts",
        security: [
          {
            BearerAuth: [],
          },
        ],
        response: {
          200: {
            description: "Successful",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                type: { type: "string" },
                history: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      amount: { type: "number" },
                      timestamp: { type: "string" },
                      toAddres: { type: "string" },
                      currency: { type: "string" },
                      status: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          400: {
            description: "Failed Request",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            description: "Not Found",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await authenticate(request);
      const accounts = await getAccounts(user.localData.id);
      reply.send(accounts);
    }
  );

  fastify.post(
    "/accounts/create",
    {
      schema: {
        description: "Create User's Payment Accounts",
        tags: ["Payment Account"],
        summary: "Create Payment Accounts",
        security: [
          {
            BearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["type"],
          properties: {
            type: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Successful",
            type: "object",
            properties: {
              id: { type: "number" },
              type: { type: "string" },
              history: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    amount: { type: "number" },
                    timestamp: { type: "string" },
                    toAddres: { type: "string" },
                    currency: { type: "string" },
                    status: { type: "string" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          400: {
            description: "Failed Request",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { type } = request.body as {
        type: string;
      };
      const user = await authenticate(request);
      const accounts = await createAccount(user.localData.id, type);
      reply.send(accounts);
    }
  );
}
