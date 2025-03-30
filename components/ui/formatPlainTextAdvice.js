export default function formatPlainTextAdvice(adviceText) {
  // Split text into paragraphs
  const paragraphs = adviceText
    .split(/\n|\*/)
    .map((p) => p.trim())
    .filter((p) => p);

  // Identify sections in the text
  let formattedText =
    "📌 **Investment Advice**\n------------------------------\n";

  paragraphs.forEach((para) => {
    if (para.toLowerCase().includes("risk tolerance")) {
      formattedText += `📊 **Risk Tolerance:**\n${para.replace("Risk Tolerance:", "").trim()}\n\n`;
    } else if (para.toLowerCase().includes("investment horizon")) {
      formattedText += `📈 **Investment Horizon:**\n${para.replace("Investment Horizon:", "").trim()}\n\n`;
    } else if (para.toLowerCase().includes("financial goals")) {
      formattedText += `🎯 **Financial Goals:**\n${para.replace("Financial Goals:", "").trim()}\n\n`;
    }else if (para.toLowerCase().includes("**")) {
      formattedText += `🎯 ****\n${para.replace("Financial Goals:", "").trim()}\n\n`;
    } else {
      formattedText += `💡 ${para}\n\n`;
    }
  });

  formattedText += "------------------------------\n💡 *Invest wisely!*";
  return formattedText;
}
