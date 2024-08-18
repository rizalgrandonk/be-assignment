import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";
import { supabase } from "./supabaseClient";

export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  const { user } = data;

  if (error) throw new Error(error.message);

  const localData = await prisma.user.create({
    data: { email },
  });

  return { ...user, localData };
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data.session?.access_token;
}

export async function getAccounts(userId: number) {
  return await prisma.paymentAccount.findMany({
    where: { userId },
    include: { history: true },
  });
}
