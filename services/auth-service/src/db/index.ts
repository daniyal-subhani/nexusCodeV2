import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as AuthSchema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE URL is not defined in environment variables');
}

const poolConnection = mysql.createPool({
  uri: connectionString,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
});

export const db = drizzle(poolConnection, {
  schema: AuthSchema,
  mode: 'default',
});
