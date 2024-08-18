import { FastifyInstance, FastifyRequest } from "fastify";
import {
  registerUser,
  loginUser,
  getAccounts,
} from "../services/accountManager";
import { supabase } from "../services/supabaseClient";
import { prisma } from "../db/prisma";

async function authenticate(request: FastifyRequest) {
  const token = request.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("Unauthorized");

  const { data, error } = await supabase.auth.getUser(token);
  const { user } = data;
  if (error || !user) throw new Error("Unauthorized");

  if (!user.email) throw new Error("Unauthorized");

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
  fastify.post("/register", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };
    const user = await registerUser(email, password);
    reply.send(user);
  });

  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };
    const token = await loginUser(email, password);
    reply.send({ token });
  });

  fastify.get("/accounts", async (request, reply) => {
    const user = await authenticate(request);
    const accounts = await getAccounts(user.localData.id);
    reply.send(accounts);
  });
}
