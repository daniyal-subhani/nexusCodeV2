// ek chhoti test file: src/test-db.ts
import { db } from '@/db';
import { auth } from '@/db/schema';

const users = await db.select().from(auth).limit(1);
console.log('DB connected. Users:', users);
