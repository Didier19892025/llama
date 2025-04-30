import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST() {
  try {
    // Obtener cookies de forma segura
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");
    
    // Preparar la respuesta
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
    
    // Eliminar cookies usando el método Set-Cookie en la respuesta
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 0, // Esto hará que la cookie expire inmediatamente
    };
    
    // Agregar cookies para eliminarlas
    response.headers.append("Set-Cookie", serialize("auth_token", "", cookieOptions));
    response.headers.append("Set-Cookie", serialize("username", "", { ...cookieOptions, httpOnly: false }));
    response.headers.append("Set-Cookie", serialize("name", "", { ...cookieOptions, httpOnly: false }));
    response.headers.append("Set-Cookie", serialize("role", "", { ...cookieOptions, httpOnly: false }));
    
    // Si no hay token, simplemente devolvemos la respuesta con las cookies eliminadas
    if (!token || !token.value) {
      console.log("No se encontró token, solo se eliminan cookies");
      return response;
    }

    try {
      // Verificar y decodificar el token
      const decodedToken = jwt.verify(token.value, process.env.JWT_SECRET!) as {
        userId: number;
        username: string;
        role: string;
      };
      
      console.log(`Cerrando sesión para usuario: ${decodedToken.username}, ID: ${decodedToken.userId}`);
      
      // Crear timestamp exacto para el cierre
      const closeTime = new Date();
      
      // Buscar la sesión activa más reciente para este usuario
      const activeSession = await prisma.session.findFirst({
        where: {
          userId: decodedToken.userId,
          timeEnd: null,
        },
        orderBy: {
          timeInit: "desc",
        },
      });
      
      if (activeSession) {
        // Actualizar el registro de la fecha de salida
        await prisma.session.update({
          where: { id: activeSession.id },
          data: { timeEnd: closeTime },
        });
        
        console.log(`Sesión ${activeSession.id} cerrada correctamente a las: ${closeTime.toISOString()}`);
      } else {
        console.warn(`No se encontró sesión activa para el usuario ${decodedToken.userId}`);
      }
      
      return response;
      
    } catch (error) {
      console.error("Error al verificar el token:", error);
      // Aún así devolvemos una respuesta exitosa con las cookies eliminadas
      return response;
    }
  } catch (error) {
    console.error("Error general en logout:", error);
    return NextResponse.json(
      { success: false, message: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}