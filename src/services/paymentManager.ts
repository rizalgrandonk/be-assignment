import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import cron from "node-cron";

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
  toAddress: string,
  accountId: number
) {
  const transaction = await prisma.transaction.create({
    data: { accountId, amount, currency, toAddress, status: "pending" },
  });

  finishTransaction(transaction);

  return transaction;
}

export async function withdrawMoney(
  amount: number,
  currency: string,
  accountId: number
) {
  const transactionData = {
    amount,
    currency,
    accountId,
    toAddress: "bank",
    status: "pending",
  };

  const transaction = await prisma.transaction.create({
    data: transactionData,
  });

  finishTransaction(transaction);

  return transaction;
}

// Function to process a single recurring payment
async function processRecurringPayment(
  amount: number,
  currency: string,
  toAddress: string,
  accountId: number
) {
  const transaction = await prisma.transaction.create({
    data: {
      amount,
      toAddress,
      currency,
      accountId,
      status: "pending",
      timestamp: new Date(),
    },
  });

  await finishTransaction(transaction);
  const transactionId = transaction.id;

  console.log(`Recurring payment processed for transaction ${transactionId}`);
}

// Function to set up a recurring payment
export async function setupRecurringPayment(
  amount: number,
  currency: string,
  toAddress: string,
  accountId: number
) {
  const cronExpression = "*/5 * * * *";

  // Schedule the recurring payment
  cron.schedule(cronExpression, () => {
    processRecurringPayment(amount, currency, toAddress, accountId);
  });

  return {
    message: "success",
  };
}
