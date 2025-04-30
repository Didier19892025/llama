import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export default async function middleware(req: NextRequest) {
  // Ruta pública principal (login)
  const isPublicRoute = req.nextUrl.pathname === "/";
  
  // Si es la ruta principal (login)
  if (isPublicRoute) {
    // Verificar si ya hay un token y redirigir según el rol
    const token = req.cookies.get("auth_token")?.value;
    
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userRole = payload.role as string;
        
        // Si es ADMIN, redirigir a admin dashboard
        if (userRole === "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        } else {
          // Si es usuario normal, redirigir a newChat
          return NextResponse.redirect(new URL("/dashboard/newChat", req.url));
        }
      } catch {
        // Token inválido, continuar a la página de login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }
  
  // Verificación de acceso para rutas protegidas
  const token = req.cookies.get("auth_token")?.value;
  
  // Si no hay token, redirigir a la ruta principal
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  try {
    // Verificar el token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Verificar el rol del usuario
    const userRole = payload.role as string;
    
    // Verificar si es una ruta de administrador (pero no newChat)
    const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/admin");
    // const isNewChatRoute = req.nextUrl.pathname === "/dashboard/newChat";
    
    // Si el usuario no es admin y está intentando acceder a rutas de admin
    if (isAdminRoute && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/newChat", req.url));
    }
    
    // Permitir acceso a newChat para todos los usuarios (admin y no admin)
    // y permitir acceso a rutas de admin solo para administradores
    return NextResponse.next();
  } catch (error) {
    // Si el token es inválido, redirigir a la ruta principal
    console.error("Error verificando token:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    // Verificar todas las rutas excepto recursos estáticos y APIs
    "/((?!_next/static|_next/image|favicon.ico|api|assets|public).*)",
  ],
};