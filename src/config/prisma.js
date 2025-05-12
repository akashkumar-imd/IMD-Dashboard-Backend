import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}