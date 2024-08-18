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
        body: {
          type: "object",
          required: ["amount", "currency", "accountId"],
          properties: {
            amount: { type: "number" },
            accountId: { type: "number" },
            currency: { type: "string" },
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
