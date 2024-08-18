import "dotenv/config";
import "./db/prisma";
import Fastify from "fastify";
import { accountRoutes } from "./routes/accountRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { STATUS_CODES } from "http";

const fastify = Fastify({ logger: true });

fastify.register(accountRoutes);
fastify.register(paymentRoutes);

fastify.setErrorHandler(function (error, request, reply) {
  reply.status(error.statusCode || 500).send({
    error: STATUS_CODES[error.statusCode || 500],
    message: error.message,
  });
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
