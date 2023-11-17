import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import * as jose from "jose";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    return Response.json({ message: "Method not allowed." }, { status: 405 });
}

export async function POST(request: Request) {
    const { email, name, password } = await request.json();

    if (!email || !password || !name) {
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

    const hashedPassword = await bcrypt.hash(password.toString(), 10);

    const user = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
        }
    });


    const alg = "HS256";
    const signature = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ email: email })
        .setProtectedHeader({ alg })
        .setExpirationTime("1m")
        .sign(signature);

    return Response.json({
        token: token,
        user: {
            email: user.email,
            name: user.name,
            id: user.id,
        }
    });
}