import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

/**
 * Configure the email transporter using environment variables.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a verification email with a tokenized link.
 *
 * @param {string} email - The recipient's email address
 * @param {string} token - The verification token
 */
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const mailOptions = {
    from: `"DevConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your DevConnect Email",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Welcome to DevConnect!</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If the button doesn't work, you can also click this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (err) {
    console.error("❌ Verification email failed:", err.message);
    // If you want to throw error instead of sending response here
    // throw new Error("Email sending failed");
  }
};

/**
 * Send a password reset email with a tokenized link.
 *
 * @param {string} email - The recipient's email address
 * @param {string} resetURL - The reset link with token
 */
export const sendResetPasswordEmail = async (email, resetURL) => {
  const mailOptions = {
    from: `"DevConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your DevConnect Password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Password Reset Request</h2>
        <p>You recently requested to reset your password. Click the button below to continue:</p>
        <a href="${resetURL}" style="padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, you can ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset password email sent to ${email}`);
  } catch (err) {
    console.error("❌ Reset password email failed:", err.message);
    // You can choose to rethrow or handle gracefully
  }
};
