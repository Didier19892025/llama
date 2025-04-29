// src/app/api/users/[id]/route.ts
import { prisma } from '@/src/lib/prisma';
import { userSchema } from '@/src/schemas/userSchemas';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Obtener un usuario por ID
export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const userId = params.id;
    
    // En producción, aquí se podría conectar a un microservicio
    // const response = await fetch(`${process.env.USER_SERVICE_URL}/${userId}`);
    // if (!response.ok) throw new Error('Error en servicio externo');
    // const data = await response.json();
    
    // Por ahora, usamos Prisma directamente
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

// Actualizar un usuario
export async function PUT(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const userData = userSchema.parse(body);

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se está actualizando el email, verificar que no exista ya
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'El correo electrónico ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Si se está actualizando el username, verificar que no exista ya
    if (userData.user && userData.user !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: userData.user },
      });

      if (usernameExists) {
        return NextResponse.json(
          { success: false, message: 'El nombre de usuario ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Actualizar usuario
    // En producción, se podría enviar a un microservicio
    // const serviceResponse = await fetch(`${process.env.USER_SERVICE_URL}/${userId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData),
    // });
    // const result = await serviceResponse.json();
    
    // Por ahora, usamos Prisma directamente
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.name,
        email: userData.email,
        username: userData.user,
        role: userData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Usuario actualizado exitosamente',
        user: updatedUser 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error de validación', 
          errors: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}


// Eliminar un usuario
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Primero eliminamos todas las sesiones asociadas al usuario
    await prisma.session.deleteMany({
      where: { userId: userId },
    });

    // Luego eliminamos el usuario
    await prisma.user.delete({
      where: { id: userId },
    });


    return NextResponse.json(
      { success: true, message: 'Usuario y sus sesiones eliminados exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { success: false, message: 'Error al eliminar usuario y sus sesiones' },
      { status: 500 }
    );
  }
}