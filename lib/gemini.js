import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEYY; // Store in .env file

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function getInvestmentAdvice(income, question = "") {
  const prompt = question
    ? `${question} INR ${income}`
    : `I have a monthly net income of ${income} INR. 
    Give me an investment recommendation based on my income.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't fetch the investment advice right now.";
  }
}
