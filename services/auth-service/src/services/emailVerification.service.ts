import { sendVerificationEmail } from "@/utils/mailer";

export const verificationService = {
     async verifyEmailHandler(token: string) {
    if (!token) {
      throw new HttpError(400, 'Something went wrong');
    }
    const incomingHash = hashToken(token);
    const verificationRecord = await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.tokenHash, incomingHash),
    });
    if (!verificationRecord) {
      throw new UnauthorizedError('Invalid verification token!');
    }
    if (new Date() > verificationRecord.expiresAt) {
      throw new UnauthorizedError('Verification token expired.');
    }
    await verificationEmailRepository.verifiedUserEmail(verificationRecord.userId);
    await verificationEmailRepository.deleteVerificationTokenById(verificationRecord.id);
    return { message: 'Email successfully verified!' };
  },
  async sendVerificationEmail() {},
  async resendVerification() {}
}