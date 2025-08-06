import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIResponse {
  response: {
    candidates?: Array<{
      content: {
        parts: Array<{
          text?: string;
        }>;
      };
    }>;
  };
}
import { inngest } from "./client";

// Type definitions
interface Expense {
  _id: Id<"expenses">;
  amount: number;
  category?: string;
  description: string;
  date: number;
  paidByUserId: string;
  createdBy: string;
}

interface User {
  _id: Id<"users">;
  name: string;
  email: string;
}

interface ExpenseData {
  expenses: Expense[];
  totalSpent: number;
  categories: Record<string, number>;
}

interface ProcessingResult {
  userId: Id<"users">;
  success: boolean;
  error?: string;
}

interface SummaryResult {
  processed: number;
  success: number;
  failed: number;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/* Gemini model */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

export const spendingInsights = inngest.createFunction(
  { name: "Generate Spending Insights", id: "generate-spending-insights" },
  { cron: "0 8 1 * *" }, // 1 st of every month at 08:00
  async ({ step }): Promise<SummaryResult> => {
    /* ─── 1. Pull users with expenses this month ────────────────────── */
    const users: User[] = await step.run(
      "Fetch users with expenses",
      async () => {
        // TODO: Implement api.inngest.getUsersWithExpenses when available
        return [] as User[];
        // return await convex.query(api.inngest.getUsersWithExpenses);
      }
    );

    /* ─── 2. Iterate users & send insight email ─────────────────────── */
    const results: ProcessingResult[] = [];

    for (const user of users) {
      /* a. Pull last-month expenses (skip if none) */
      const expenses: Expense[] = await step.run(
        `Expenses · ${user._id}`,
        () => {
          // TODO: Implement api.inngest.getUserMonthlyExpenses when available
          return [] as Expense[];
          // return convex.query(api.inngest.getUserMonthlyExpenses, { userId: user._id });
        }
      );
      if (!expenses?.length) continue;

      /* b. Build JSON blob for the prompt */
      const categories: Record<string, number> = {};
      expenses.forEach((e) => {
        const category = e.category ?? "uncategorised";
        categories[category] = (categories[category] || 0) + e.amount;
      });

      const expenseData: ExpenseData = {
        expenses,
        totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
        categories,
      };

      /* c. Prompt + AI call using step.ai.wrap (retry-aware) */
      const prompt = `
As a financial analyst, review this user's spending data for the past month and provide insightful observations and suggestions.
Focus on spending patterns, category breakdowns, and actionable advice for better financial management.
Use a friendly, encouraging tone. Format your response in HTML for an email.

User spending data:
${JSON.stringify(expenseData)}

Provide your analysis in these sections:
1. Monthly Overview
2. Top Spending Categories
3. Unusual Spending Patterns (if any)
4. Saving Opportunities
5. Recommendations for Next Month
      `.trim();

      try {
        const aiResponse = await step.ai.wrap(
          "gemini",
          async (p) => model.generateContent(p),
          prompt
        );

        // Handle AI response with proper typing - using unknown for complex Gemini types
        let htmlBody = "";
        try {
          const response = aiResponse as unknown as AIResponse;
          if (response?.response?.candidates?.[0]?.content?.parts) {
            const textPart = response.response.candidates[0].content.parts.find(
              (part: unknown) =>
                typeof part === "object" && part !== null && "text" in part
            ) as { text?: string } | undefined;
            htmlBody = textPart?.text ?? "";
          }
        } catch {
          htmlBody = "Unable to generate insights at this time.";
        }

        /* d. Send the email */
        await step.run(`Email · ${user._id}`, async () => {
          try {
            // Use api reference with type bypass for complex generated types
            const emailResult = await convex.action(api.email.sendEmail, {
              to: user.email,
              subject: "Your Monthly Spending Insights",
              html: `
                <h1>Your Monthly Financial Insights</h1>
                <p>Hi ${user.name},</p>
                <p>Here's your personalized spending analysis for the past month:</p>
                ${htmlBody}
              `,
              apiKey: process.env.RESEND_API_KEY || "",
            } as Parameters<typeof convex.action>[1]);
            console.log("Email sent successfully:", emailResult);
          } catch (emailError) {
            console.warn("Failed to send email:", emailError);
            // Email failure shouldn't break the overall process
          }
        });

        results.push({ userId: user._id, success: true });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        results.push({
          userId: user._id,
          success: false,
          error: errorMessage,
        });
      }
    }

    /* ─── 3. Summary for the cron log ───────────────────────────────── */
    return {
      processed: results.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }
);
