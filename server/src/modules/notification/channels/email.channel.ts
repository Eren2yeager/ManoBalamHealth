import { Resend } from "resend";
import { env } from "@/config/env";
import { UserModel } from "@/modules/user/user.model";

const resend = new Resend(env.RESEND_API_KEY);

// Use Resend's shared sender until a custom domain is verified in the Resend dashboard.
// Once verified, update this to e.g. "ManoBalam <noreply@manobalam.com>"
const FROM_ADDRESS = "ManoBalam <onboarding@resend.dev>";

/**
 * Send an OTP verification email directly to a known email address.
 * Used by auth flows where we have the address before the user exists fully in DB.
 */
export const sendOtpEmail = async (
  toEmail: string,
  userName: string,
  otp: string
): Promise<void> => {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Verify your ManoBalam account</h2>
      <p>Hi ${userName},</p>
      <p>Use the code below to verify your account. It expires in <strong>5 minutes</strong>.</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center;
                  padding: 24px; background: #f4f4f5; border-radius: 8px; margin: 24px 0;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        If you didn't create a ManoBalam account, you can safely ignore this email.
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: `${otp} is your ManoBalam verification code`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
};

/**
 * Send a general email to a user looked up by userId.
 * Used by the notification worker for appointment confirmations, reminders, etc.
 */
export const sendEmail = async (
  userId: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  const user = await UserModel.findById(userId);
  if (!user || !user.email) {
    throw new Error(`User ${userId} not found or has no email address`);
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: user.email,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
};
