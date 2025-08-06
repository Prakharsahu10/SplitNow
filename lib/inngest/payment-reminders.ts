// import { ConvexHttpClient } from "convex/browser";
// import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { inngest } from "./client"; // Type definitions
interface Debt {
  name: string;
  amount: number;
}

interface UserWithDebts {
  _id: Id<"users">;
  name: string;
  email: string;
  debts: Debt[];
}

interface EmailResult {
  userId: Id<"users">;
  success?: boolean;
  skipped?: boolean;
  error?: string;
}

interface ProcessingResult {
  processed: number;
  successes: number;
  failures: number;
}

// Initialize Convex client (for future use)
// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const paymentReminders = inngest.createFunction(
  { id: "send-payment-reminders" },
  { cron: "0 10 * * *" }, // daily at 10 AM UTC
  async ({ step }): Promise<ProcessingResult> => {
    /* 1. fetch all users that still owe money */
    // TODO: Implement api.inngest.getUsersWithOutstandingDebts
    const users: UserWithDebts[] = await step.run("fetch‑debts", async () => {
      // Placeholder implementation - replace with actual API call when available
      return [] as UserWithDebts[];
      // return convex.query(api.inngest.getUsersWithOutstandingDebts);
    });

    /* 2. build & send one e‑mail per user */
    const results: EmailResult[] = await step.run("send‑emails", async () => {
      return Promise.all(
        users.map(async (u: UserWithDebts): Promise<EmailResult> => {
          const rows: string = u.debts
            .map(
              (d: Debt) => `
                <tr>
                  <td style="padding:4px 8px;">${d.name}</td>
                  <td style="padding:4px 8px;">$${d.amount.toFixed(2)}</td>
                </tr>
              `
            )
            .join("");

          if (!rows) return { userId: u._id, skipped: true };

          const html: string = `
            <h2>SplitNow – Payment Reminder</h2>
            <p>Hi ${u.name}, you have the following outstanding balances:</p>
            <table cellspacing="0" cellpadding="0" border="1" style="border-collapse:collapse;">
              <thead>
                <tr><th>To</th><th>Amount</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p>Please settle up soon. Thanks!</p>
          `;

          try {
            // TODO: Send email using Convex action once api.email.sendEmail is available
            // const emailResult = await convex.action(api.email.sendEmail, {
            //   to: u.email,
            //   subject: "You have pending payments on SplitNow",
            //   html,
            //   apiKey: process.env.RESEND_API_KEY!,
            // });

            // Placeholder implementation for now
            console.log(
              `Would send email to ${u.email}: ${html.substring(0, 100)}...`
            );
            return { userId: u._id, success: true };
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : "Unknown error";
            return { userId: u._id, success: false, error: errorMessage };
          }
        })
      );
    });

    return {
      processed: results.length,
      successes: results.filter((r: EmailResult) => r.success).length,
      failures: results.filter((r: EmailResult) => r.success === false).length,
    };
  }
);
