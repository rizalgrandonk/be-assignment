import "dotenv/config";
import "./db/prisma";
import Fastify from "fastify";
import { accountRoutes } from "./routes/accountRoutes";
// import { paymentRoutes } from './routes/paymentRoutes';

const fastify = Fastify({ logger: true });

fastify.register(accountRoutes);
// fastify.register(paymentRoutes);

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
