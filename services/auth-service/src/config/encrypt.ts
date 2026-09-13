import * as argon2 from 'argon2';

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 64 * 1024,
  timeCost: 3,
  parallelism: 4,
} as const;

export async function hashPassword(password: string) {
  try {
    const hash = await argon2.hash(password, hashingOptions);
    return hash;
  } catch (error) {
    console.error('Hashing failed:', error);
    throw error;
  }
}

export async function verifyHash(storedHash: string, incommingPassword: string) {
  try {
    const isMatch = await argon2.verify(storedHash, incommingPassword);
    return isMatch;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}
