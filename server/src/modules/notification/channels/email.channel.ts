import { Resend } from "resend";
import { env } from "@/config/env";
import { UserModel } from "@/modules/user/user.model";

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (
  userId: string,
  subject: string,
  html: string,
  text?: string
) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.email) {
    throw new Error("User not found or no email address");
  }

  return await resend.emails.send({
    from: "ManoBalam <notifications@manobalam.com>",
    to: user.email,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  });
};
