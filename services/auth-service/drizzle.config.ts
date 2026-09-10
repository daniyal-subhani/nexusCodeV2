import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
const connString = process.env.DATABASE_URL as string;
if (!connString) {
  throw new Error('Database url is missing in env');
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: connString,
  },
});
