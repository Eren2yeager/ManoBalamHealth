import { Resend } from "resend";
import { env } from "@/config/env";
import { UserModel } from "@/modules/user/user.model";
import { logger } from "@/utils/logger";

const resend = new Resend(env.RESEND_API_KEY);
const FROM_ADDRESS = env.EMAIL_FROM ?? "ManoBalam <onboarding@resend.dev>";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const deliverEmail = async ({
  to,
  subject,
  html,
  text,
  developmentCode,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  developmentCode?: string;
}): Promise<void> => {
  if (env.EMAIL_DELIVERY_MODE === "console") {
    logger.warn("Development email captured instead of sent", {
      metadata: {
        to,
        subject,
        ...(developmentCode ? { verificationCode: developmentCode } : {}),
      },
    });
    return;
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    const providerError = new Error(`Resend delivery failed: ${error.message}`);
    providerError.name = "EmailDeliveryError";
    throw providerError;
  }

  logger.info("Email accepted by provider", {
    metadata: { messageId: data?.id, to, subject },
  });
};

export const sendOtpEmail = async (
  toEmail: string,
  userName: string,
  otp: string,
): Promise<void> => {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Verify your ManoBalam account</h2>
      <p>Hi ${escapeHtml(userName)},</p>
      <p>Use the code below to verify your account. It expires in <strong>5 minutes</strong>.</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center;
                  padding: 24px; background: #f4f4f5; border-radius: 8px; margin: 24px 0;">
        ${escapeHtml(otp)}
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        If you didn't create a ManoBalam account, you can safely ignore this email.
      </p>
    </div>
  `;

  await deliverEmail({
    to: toEmail,
    subject: `${otp} is your ManoBalam verification code`,
    html,
    developmentCode: otp,
  });
};

export const sendPasswordResetEmail = async (
  toEmail: string,
  userName: string,
  resetUrl: string,
): Promise<void> => {
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
      <h2>Reset your ManoBalam password</h2>
      <p>Hi ${escapeHtml(userName)},</p>
      <p>Use the secure link below to create a new password. It expires in 15 minutes.</p>
      <p style="margin: 28px 0;">
        <a href="${escapeHtml(resetUrl)}" style="background:#6d28d9;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;">
          Reset password
        </a>
      </p>
      <p style="color:#6b7280;font-size:14px;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  await deliverEmail({
    to: toEmail,
    subject: "Reset your ManoBalam password",
    html,
  });
};

export const sendEmail = async (
  userId: string,
  subject: string,
  html: string,
  text?: string,
): Promise<void> => {
  const user = await UserModel.findById(userId);
  if (!user?.email) {
    throw new Error(`User ${userId} not found or has no email address`);
  }

  await deliverEmail({
    to: user.email,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  });
};
