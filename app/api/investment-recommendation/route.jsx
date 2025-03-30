import { NextResponse } from "next/server";
// import { getUserAccounts } from "@/actions/dashboard";
import { getDefaultUserAccount } from "@/actions/dashboard";
import { getInvestmentAdvice } from "@/lib/gemini";
import formatPlainTextAdvice from "@/components/ui/formatPlainTextAdvice";


export async function POST(req) {
  try {
    const bodyText = await req.text();
    console.log("📩 Received body:", bodyText);

    if (!bodyText.trim()) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    let question;
    try {
      ({ question } = JSON.parse(bodyText));
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    console.log("❓ Received question:", question);

    // 🟢 Fetch default user account
    const { monthlyIncome, monthlyExpenses } = await getDefaultUserAccount();

    if (monthlyIncome === undefined || monthlyExpenses === undefined) {
      throw new Error("Failed to fetch user account details.");
    }

    const monthlyNetIncome = monthlyIncome - monthlyExpenses;
    console.log("💰 Calculated Net Income:", monthlyNetIncome);


    // Get investment advice from Gemini AI
    const rawResponse = await getInvestmentAdvice(monthlyNetIncome, question);
    const formattedResponse = formatPlainTextAdvice(rawResponse);

    return NextResponse.json({ recommendation: formattedResponse }, { status: 200 });
  } catch (error) {
    console.error("Error fetching investment recommendation:", error);
    return NextResponse.json({ error: "Failed to get recommendation" }, { status: 500 });
  }
}