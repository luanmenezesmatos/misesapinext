import { PrismaClient } from "@prisma/client";
import * as jose from "jose";

const prisma = new PrismaClient();

export async function GET() {
    return Response.json({ message: "Method not allowed." }, { status: 405 });
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return Response.json({ message: "Email is missing." }, { status: 400 });
        }

        const userWithEmail = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!userWithEmail) {
            return Response.json({ message: "User not found." }, { status: 404 });
        }

        const alg = "HS256";
        const signature = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new jose.SignJWT({ email: email })
            .setProtectedHeader({ alg })
            .setExpirationTime("5m")
            .sign(signature);

        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                bearerTokenAuth: token
            }
        });

        return Response.json({
            token: token,
            user: {
                email: userWithEmail.email,
                id: userWithEmail.id,
            }
        });
    } catch (err) {
        return Response.json({ message: "Error generating token." }, { status: 500 });
    }
}