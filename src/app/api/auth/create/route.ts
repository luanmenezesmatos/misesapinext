import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import * as jose from "jose";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    return Response.json({ message: "Method not allowed." }, { status: 405 });
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return Response.json({ message: "Email, password or name is missing." }, { status: 400 });
        }

        const userWithEmail = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (userWithEmail) {
            return Response.json({ message: "Email already exists." }, { status: 400 });
        }

        const alg = "HS256";
        const signature = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new jose.SignJWT({ email: email })
            .setProtectedHeader({ alg })
            .setExpirationTime("5m")
            .sign(signature);

        const user = await prisma.user.create({
            data: {
                email: email,
                bearerTokenAuth: token
            }
        });

        return Response.json({
            token: token,
            user: {
                email: user.email,
                id: user.id,
            }
        });
    } catch (err) {
        return Response.json({ message: "Error creating user." }, { status: 500 });
    }
}