import { v } from "convex/values";
import { action, ActionCtx } from "./_generated/server";
import { Resend } from "resend";

// Type definitions
interface EmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  apiKey: string;
}

interface EmailSuccessResponse {
  success: true;
  id: string;
}

interface EmailErrorResponse {
  success: false;
  error: string;
}

type EmailResponse = EmailSuccessResponse | EmailErrorResponse;

// Action to send email using Resend
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
    apiKey: v.string(),
  },
  handler: async (ctx: ActionCtx, args: EmailArgs): Promise<EmailResponse> => {
    const resend = new Resend(args.apiKey);

    try {
      const result = await resend.emails.send({
        from: "Splitr <onboarding@resend.dev>",
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
      });

      console.log("Email sent successfully:", result);

      // Handle Resend API response structure
      if (result.data) {
        return { success: true, id: result.data.id };
      } else {
        return {
          success: false,
          error: result.error?.message || "Unknown error",
        };
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, error: errorMessage };
    }
  },
});
