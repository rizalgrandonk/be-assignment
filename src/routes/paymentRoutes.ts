import { FastifyInstance } from "fastify";
import { sendMoney, withdrawMoney } from "../services/paymentManager";

export async function paymentRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/send",
    {
      schema: {
        body: {
          type: "object",
          required: ["amount", "toAddress", "currency"],
          properties: {
            amount: { type: "number" },
            toAddress: { type: "string" },
            currency: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { amount, toAddress, currency } = request.body as {
        amount: number;
        toAddress: string;
        currency: string;
      };
      const result = await sendMoney(amount, toAddress, currency);
      reply.send(result);
    }
  );

  fastify.post(
    "/withdraw",
    {
      schema: {
        body: {
          type: "object",
          required: ["amount", "currency"],
          properties: {
            amount: { type: "number" },
            currency: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { amount, currency } = request.body as {
        amount: number;
        currency: string;
      };
      const result = await withdrawMoney(amount, currency);
      reply.send(result);
    }
  );
}
