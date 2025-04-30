import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// Validar que la clave JWT esté configurada
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validación básica de campos
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Registrar nueva sesión (con timeInit por defecto en now())
    await prisma.session.create({
      data: { userId: user.id,},
    });

    // Crear token JWT
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET no está definido en las variables de entorno");
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // Crear respuesta
    const response = NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });

    // Opciones base para cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 60 * 60, // 1 hora
    };

    // Cookie con token (httpOnly)
    response.headers.append(
      "Set-Cookie",
      serialize("auth_token", token, cookieOptions)
    );

    // Cookies accesibles desde el cliente
    const clientCookieOptions = { ...cookieOptions, httpOnly: false };

    response.headers.append("Set-Cookie", serialize("username", user.username, clientCookieOptions));
    response.headers.append("Set-Cookie", serialize("name", user.name, clientCookieOptions));
    response.headers.append("Set-Cookie", serialize("role", user.role, clientCookieOptions));

    return response;

  } catch (error) {
    console.error("Error en la ruta de inicio de sesión:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error en la ruta de inicio de sesión",
      },
      { status: 500 }
    );
  }
}
