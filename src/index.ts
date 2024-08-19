import "dotenv/config";
import "./db/prisma";
import Fastify from "fastify";
import { accountRoutes } from "./routes/accountRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { STATUS_CODES } from "http";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

const fastify = Fastify({ logger: true });

fastify.register(swagger, {
  openapi: {
    info: {
      title: "API Documentation",
      description: "API documentation for my project",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Optional, can be 'JWT' or any other token format
        },
      },
    },
  },
});

fastify.register(swaggerUi, {
  routePrefix: "/docs", // Route where the documentation will be available
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, req, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

fastify.setErrorHandler(function (error, request, reply) {
  reply.status(error.statusCode || 500).send({
    error: STATUS_CODES[error.statusCode || 500],
    message: error.message,
  });
});

fastify.register(accountRoutes);
fastify.register(paymentRoutes);

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
