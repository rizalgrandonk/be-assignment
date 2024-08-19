import { FastifyInstance } from "fastify";
import { sendMoney, withdrawMoney } from "../services/paymentManager";
import { authenticate } from "./accountRoutes";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/error";

export async function paymentRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/send",
    {
      schema: {
        description: "Create User's Payment",
        tags: ["Payment"],
        summary: "Send",
        security: [
          {
            BearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["amount", "toAddress", "currency", "accountId"],
          properties: {
            amount: { type: "number" },
            accountId: { type: "number" },
            toAddress: { type: "string" },
            currency: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Successful",
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
      const { amount, toAddress, currency, accountId } = request.body as {
        amount: number;
        accountId: number;
        toAddress: string;
        currency: string;
      };

      const user = await authenticate(request);
      const account = await prisma.paymentAccount.findFirst({
        where: { id: accountId, userId: user.localData.id },
      });

      if (!account) {
        throw new ApiError(404, "Account does not exist");
      }

      const result = await sendMoney(amount, currency, toAddress, accountId);
      reply.send(result);
    }
  );

  fastify.post(
    "/withdraw",
    {
      schema: {
        description: "Create User's Payment",
        tags: ["Payment"],
        summary: "Withdraw",
        security: [
          {
            BearerAuth: [],
          },
        ],
        body: {
          type: "object",
          required: ["amount", "currency", "accountId"],
          properties: {
            amount: { type: "number" },
            accountId: { type: "number" },
            currency: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Successful",
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
      const { amount, currency, accountId } = request.body as {
        amount: number;
        accountId: number;
        currency: string;
      };

      const user = await authenticate(request);
      const account = await prisma.paymentAccount.findFirst({
        where: { id: accountId, userId: user.localData.id },
      });

      if (!account) {
        throw new ApiError(404, "Account does not exist");
      }

      const result = await withdrawMoney(amount, currency, accountId);
      reply.send(result);
    }
  );
}
