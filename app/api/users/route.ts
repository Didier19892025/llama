// /app/api/users/route.ts

// Importación de dependencias necesarias
import { PrismaClient } from "@prisma/client";  // Para interactuar con la base de datos
import { NextResponse } from "next/server";  // Para manejar las respuestas en Next.js
import { userSchema } from "@/src/schemas/userSchemas";  // Esquema de validación para los datos del usuario
import bcrypt from "bcryptjs";  // Librería para cifrar contraseñas
import { z } from 'zod';  // Librería para validación de datos con Zod

// Inicialización del cliente de Prisma
const prisma = new PrismaClient();

// Función para manejar las solicitudes GET
export async function GET() {
  try {
    // Obtener todos los usuarios excluyendo la contraseña
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,  // Si quieres también incluir las fechas de creación y actualización
        sessions: true,  // Incluir las sesiones si es necesario
      },
    });

    // Respuesta exitosa con los datos de los usuarios
    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    // Manejo de errores si no se puede obtener los usuarios
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener usuarios" },
      { status: 500 }
    );
  } finally {
    // Asegura que la conexión con la base de datos se cierre
    await prisma.$disconnect();
  }
}

// Función para manejar las solicitudes POST (registro de usuarios)
export async function POST(request: Request) {
  try {
    // Obtener y validar los datos JSON de la petición
    const body = await request.json();
    const userData = userSchema.parse(body);  // Validación usando Zod

    // Verificar si el correo electrónico ya existe en la base de datos
    const existingEmail = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingEmail) {
      // Si el email ya está registrado, devolver un error
      return NextResponse.json(
        {
          success: false,
          message: "El correo electrónico ya está registrado. Por favor utilice otro.",
        },
        { status: 400 }
      );
    }
    
    // Verificar si el nombre de usuario ya existe en la base de datos
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.user },
    });

    if (existingUser) {
      // Si el nombre de usuario ya está registrado, devolver un error
      return NextResponse.json(
        {
          success: false,
          message: "El nombre de usuario ya está registrado. Por favor utilice otro.",
        },
        { status: 400 }
      );
    }

    // Cifrar la contraseña antes de guardarla en la base de datos
    const saltRounds = 10;  // Número de rondas de cifrado
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Crear un nuevo usuario en la base de datos con los datos proporcionados
    const newUser = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        username: userData.user,
        password: hashedPassword,  // Guardar la contraseña cifrada
        role: userData.role,
      },
    });

    // Devolver una respuesta exitosa con los datos del nuevo usuario
    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    // Manejar errores de validación con Zod (si los datos no son válidos)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Error de validación",
          errors: error.errors,  // Incluir los errores de validación específicos
        },
        { status: 400 }
      );
    }

    // Manejo de errores específicos de Prisma
    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as {
        code: string;
        meta?: { target?: string[] };
      };

      switch (prismaError.code) {
        case "P2002":  // Error de campo único, por ejemplo, un email o nombre de usuario duplicado
          return NextResponse.json(
            {
              success: false,
              message: `El campo ${prismaError.meta?.target?.[0]} ya existe`,  // Mostrar qué campo está duplicado
            },
            { status: 409 }  // Conflicto
          );
        default:
          return NextResponse.json(
            {
              success: false,
              message: "Error de base de datos",
            },
            { status: 500 }
          );
      }
    }

    // Para otros errores genéricos
    return NextResponse.json(
      {
        success: false,
        message: "Error inesperado",
      },
      { status: 500 }
    );
  } finally {
    // Asegura que la conexión con Prisma se cierre
    await prisma.$disconnect();
  }
}
