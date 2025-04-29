import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// Verificar que JWT_SECRET esté definido
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validar los datos de entrada
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email y contraseña son requeridos",
        },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
        },
        { status: 401 }
      );
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Contraseña incorrecta",
        },
        { status: 401 }
      );
    }

    // Guardar la sesión en la base de datos
    await prisma.session.create({
      data: {
        userId: user.id,
        timeDuration: 0,
      },
    });

    // Crear el token JWT
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // Crear la respuesta
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

    // Opciones comunes para las cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 60 * 60, // 1 hora
    };

    // COOKIE httpOnly (token)
    response.headers.append(
      "Set-Cookie",
      serialize("auth_token", token, cookieOptions)
    );

    // COOKIES accesibles desde el cliente
    const clientCookieOptions = {
      ...cookieOptions,
      httpOnly: false,
    };

    // COOKIE de username
    response.headers.append(
      "Set-Cookie",
      serialize("username", user.username, clientCookieOptions)
    );

    // COOKIE de name
    response.headers.append(
      "Set-Cookie",
      serialize("name", user.name, clientCookieOptions)
    );

    // COOKIE de role
    response.headers.append(
      "Set-Cookie",
      serialize("role", user.role, clientCookieOptions)
    );

    console.log("Cookies establecidas:", {
      auth_token: "***TOKEN***",
      username: user.username,
      name: user.name,
      role: user.role,
    });

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