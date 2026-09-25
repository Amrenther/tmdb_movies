import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a connection pool using DATABASE_URL for runtime
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the Prisma PostgreSQL adapter
const adapter = new PrismaPg(pool);

// One shared PrismaClient instance for the process using the adapter
export const prisma = new PrismaClient({ adapter });
