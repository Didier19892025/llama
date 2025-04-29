"use server";

import { revalidatePath } from "next/cache";

// Función para eliminar un usuario
export async function deleteUser(id: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar el usuario');
    }

    const data = await response.json();
    
    // Revalidar la ruta para actualizar los datos
    revalidatePath('/dashboard/admin');
    
    return { success: true, data };
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al eliminar el usuario' 
    };
  }
}
