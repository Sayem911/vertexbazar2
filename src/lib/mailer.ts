// File: src/lib/mailer.ts

import User from "@/models/User";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import RedeemCode from "@/models/RedeemCode";

export const sendEmail = async ({ email, emailType, userId, redeemCode }: any) => {
  const nodemailer = require("nodemailer");

  try {
    const hashedToken = await bcryptjs.hash(userId.toString(), 10);

    if (emailType === "verify") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          verifyToken: hashedToken,
          verifyTokenExpiry: Date.now() + 3600000, // 1 hour
        },
      });
    } else if (emailType === "reset") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          resetToken: hashedToken,
          resetTokenExpiry: Date.now() + 3600000, // 1 hour
        },
      });
    }

    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    let mailOptions;

    if (emailType === "verify" || emailType === "reset") {
      mailOptions = {
        from: "sayem@sayemm.ai",
        to: email,
        subject: emailType === "verify" ? "Verify your email" : "Reset your password",
        html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to 
              ${emailType === "verify" ? "verify your email" : "reset your password"}
              or copy and paste the link below in your browser.
              <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
              </p>`,
      };
    } else if (emailType === "redeem") {
      mailOptions = {
        from: "sayem@sayemm.ai",
        to: email,
        subject: "Your Redeem Code",
        html: `<p>Your redeem code is: ${redeemCode}</p>`,
      };
    }

    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
