import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

type TransactionCreate = Prisma.Args<
  typeof prisma.transaction,
  "create"
>["data"];

export async function processTransaction(transaction: TransactionCreate) {
  return new Promise((resolve, reject) => {
    console.log("Transaction processing started for:", transaction);

    // Simulate long running process
    setTimeout(() => {
      // After 30 seconds, we assume the transaction is processed successfully
      console.log("transaction processed for:", transaction);
      resolve(transaction);
    }, 30000); // 30 seconds
  });
}

async function finishTransaction(transaction: TransactionCreate) {
  await processTransaction(transaction);

  return await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: "success" },
  });
}

export async function sendMoney(
  amount: number,
  currency: string,
  toAddress: string
) {
  const transaction = await prisma.transaction.create({
    data: { amount, currency, toAddress, status: "pending" },
  });

  finishTransaction(transaction);

  return transaction;
}

export async function withdrawMoney(amount: number, currency: string) {
  const transactionData = {
    amount,
    currency,
    toAddress: "bank",
    status: "pending",
  };

  const transaction = await prisma.transaction.create({
    data: transactionData,
  });

  finishTransaction(transaction);

  return transaction;
}
