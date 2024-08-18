import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";
import { supabase } from "./supabaseClient";
import { ApiError } from "../utils/error";

export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  const { user, session } = data;

  if (error) throw new ApiError(400, error.message);

  const localData = await prisma.user.create({
    data: { email },
  });

  return { ...user, accessToken: session?.access_token, localData };
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new ApiError(400, error.message);

  return data.session?.access_token;
}

export async function getAccounts(userId: number) {
  return await prisma.paymentAccount.findMany({
    where: { userId },
    include: { history: true },
  });
}

export async function createAccount(userId: number, type: string) {
  return await prisma.paymentAccount.create({
    data: { userId, type },
    include: { history: true },
  });
}
