import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const users = await prisma.user.findMany();
  return Response.json(users);
}

export async function POST() {
  return Response.json({ message: 'Method not allowed.' }, { status: 405 });
}
