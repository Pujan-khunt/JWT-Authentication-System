import { transporter } from "../config/email.config.js";
import { emailVerificationTemplate } from "../utils/emailTemplates.js";

export const sendVerificationEmail = async (to, subject, verificationLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      html: emailVerificationTemplate(verificationLink)
    };

    const response = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", response.messageId);
    return response;
  } catch (error) {
    console.log("Error sending email:", error);
    throw new Error("Could not send verification email");
  }
};