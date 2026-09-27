import nodemailer from 'nodemailer';
import { logger } from './logger';

export const sendVerificationEmail = async (email: string, unhashedToken: string) => {
  const testAccount = await nodemailer.createTestAccount();
  const transpoter = await nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Verification Link jo user ke pas jayega
  const verificationUrl = `http://localhost:3000/api/v1/auth/verify-email?token=${unhashedToken}`;

  const info = await transpoter.sendMail({
    from: '"My App" <support@myapp.com>',
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Please click the link below to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a>`,
  });

  logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};
