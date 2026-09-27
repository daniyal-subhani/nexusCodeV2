import nodemailer from "nodemailer";
import { logger } from "./logger";


export const sendVerificationOTP = async (email:string, unhashedOTP: string) => {
  const userAcc = await nodemailer.createTestAccount();
  const transpoter = await nodemailer.createTransport({
    host: 'smtp.etherreal.email',
    port: 555,
    secure: true,
    auth: {
        user: userAcc.user,
        pass: userAcc.pass
    }
  });

  const info = await transpoter.sendMail({
    from: "NexusCodeV2 <support@myapp.com>",
    to: email,
    subject: unhashedOTP
  });

  logger.info("Preview URL: %s", nodemailer.getTestMessageUrl(info))
}
