import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ message: 'Email is missing.' }, { status: 400 });
    }

    const userWithEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!userWithEmail) {
      return Response.json({ message: 'User not found.' }, { status: 404 });
    }

    await prisma.user.delete({
      where: {
        email: email,
      },
    });

    return Response.json({ message: 'User deleted.' });
  } catch (error) {
    return Response.json({ message: 'Error deleting user.' }, { status: 500 });
  }
}
