export const emailVerificationTemplate = (verificationLink) => `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f9f9f9;">
    <div style="max-width: 500px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333;">Verify Your Email</h1>
      <p style="font-size: 16px; color: #555;">
        Thank you for signing up! Please verify your email to activate your account.
      </p>
      <a href="${verificationLink}" 
         style="display: inline-block; padding: 12px 20px; margin-top: 20px; font-size: 16px; font-weight: bold; 
         color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p style="margin-top: 20px; font-size: 14px; color: #777;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  </div>
`;
