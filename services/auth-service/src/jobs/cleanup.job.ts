import cron from 'node-cron';
import { refreshTokenRepo } from '@/repository/refreshToken.repository';
import { logger } from '@/utils/logger';
import { passwordRepository } from '@/repository/password.reset.repository';
import { verificationEmailRepository } from '@/repository/verificationEmail.repository';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const startCronJobs = () => {
  // refresh tokens cleanup - har raat 3 baje
  cron.schedule('0 3 * * *', async () => {
    logger.info('[CRON] Starting cleanup...');
    try {
      // 7 din purane tokens delete
      const deletedSevenDaysToken = await refreshTokenRepo.deleteUsedTokensSevenDays(SEVEN_DAYS_MS);
      logger.info(`[CRON] Deleted ${deletedSevenDaysToken} expired tokens`);

      // expired tokens (chahe used ho ya nahi)
      await refreshTokenRepo.deletedExpired();
      // 30 days old token remove
      await refreshTokenRepo.deleteUsedTokensThirtyDays(THIRTY_DAYS_MS);
      logger.info('[CRON] Refresh token cleanup done');
    } catch (error) {
      logger.error('[CRON] Cleanup failed:', error as any);
    }
  });

  // password reset cleanup - har raat 3 15
  cron.schedule('15 3 * * *', async () => {
    logger.info('[CRON] Password reset cleanup started');
    try {
      // expired ya used reset tokens (24 hours se purane)
      await passwordRepository.deleteUsedResetTokens();
      logger.info('[CRON] Password reset cleanup done');
    } catch (error) {
      logger.error('[CRON] Password reset cleanup failed:', error as any);
    }
  });

  // email verification cleanup - daily 3:30
  cron.schedule('30 3 * * *', async () => {
    logger.info('[CRON] Email verification cleanup started');
    try {
      await verificationEmailRepository.deleteExpireEmailVerifications();
      logger.info('[CRON] Email verificatoin cleanup done');
    } catch (error) {
      logger.error('[CRON] Email verification cleanup failed:', error as any);
    }
  });
  // health check har 5 minutes
  cron.schedule('*/5 * * * *', () => {
    logger.info({ time: new Date().toISOString() }, '[CRON] Health check:');
  });
  logger.info('[CRON] Jobs registered');
};
