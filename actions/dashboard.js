"use server";

import aj  from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Serialize accounts before sending to client
    const serializedAccounts = accounts.map(serializeTransaction);

    return serializedAccounts;
  } catch (error) {
    console.error(error.message);
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault, // Override the isDefault based on our logic
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTransaction);
}


// Fetch the default user account with monthly income and expenses
// export async function getDefaultUserAccount() {
//   try {
//     if (!db) {
//       throw new Error("Database connection failed.");
//     }
 

//     console.log("📡 Fetching Transactions...");

//     // Fetch all transactions
//     const transaction = await db.transaction.findMany();

//     console.log("🔍 Raw Transactions:", transaction);

//     if (!transaction || transaction.length === 0) {
//       console.error("❌ No transactions found.");
//       return { monthlyIncome: 0, monthlyExpenses: 0 }; // ✅ Always return an object
//     }

//     // Filter and sum income transactions
//     const monthlyIncome = transaction
//       .filter((t) => t.type === "INCOME")
//       .reduce((sum, t) => sum + t.amount, 0);

//     // Filter and sum expense transactions
//     const monthlyExpenses = transaction
//       .filter((t) => t.type === "EXPENSE")
//       .reduce((sum, t) => sum + t.amount, 0);

//     console.log("💰 Monthly Income:", monthlyIncome);
//     console.log("💸 Monthly Expenses:", monthlyExpenses);

//     return { monthlyIncome, monthlyExpenses };
//   } catch (error) {
//     console.error("🚨 Error fetching transactions:", error);
//     return { monthlyIncome: 0, monthlyExpenses: 0 }; // ✅ Prevent returning null
//   }
// }


export async function getDefaultUserAccount() {
  try {
    if (!db || !db.transaction) {
      throw new Error("Database connection failed or transactions table is missing.");
    }

    console.log("📡 Fetching Transactions...");

    // Get the first day of the current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    console.log(`📅 Filtering transactions between ${startOfMonth} and ${endOfMonth}`);

    // Fetch transactions for the current month only
    const transactions = await db.transaction.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // console.log("🔍 Raw Transactions:", transactions);

    if (!transactions || transactions.length === 0) {
      console.warn("⚠️ No transactions found for this month.");
      return { monthlyIncome: 0, monthlyExpenses: 0 };
    }

   
    const parseAmount = (amount) => {
      if (amount instanceof Prisma.Decimal) {
        return Number(amount.toString()); 
      }
      return Number(amount);
    };

   
    const monthlyIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  
    const monthlyExpenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + parseAmount(t.amount), 0);

    console.log(`💰 Monthly Income: ${monthlyIncome}`);
    console.log(`💸 Monthly Expenses: ${monthlyExpenses}`);
    console.log(`💡 Net Income: ${monthlyIncome - monthlyExpenses}`);

    return { monthlyIncome, monthlyExpenses };
  } catch (error) {
    console.error("🚨 Error fetching transactions:", error.message);
    return { monthlyIncome: 0, monthlyExpenses: 0 }; // ✅ Prevent returning null
  }
}