import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const body = await request.json();
    console.log("Enviando solicitud a llama_prompt:", body);
    
    // Hacer la solicitud al endpoint externo
    const response = await fetch("https://www.cloudware.com.co/llama_prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: body.username || "XYZ",
        query: body.query
      }),
    });

    console.log("Respuesta de llama_prompt - status:", response.status);
    
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    
    // Convertir la respuesta a JSON
    const data = await response.json();
    console.log("Datos recibidos de llama_prompt:", data);
    
    // Devolver la respuesta
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en la ruta API:", error);
    
    // Manejar diferentes tipos de errores
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          status: "bad",
          answer: "Lo siento, no pude conectar con el servidor. Verifica la conexión a internet o inténtalo más tarde."
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        status: "bad",
        answer: "Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."
      },
      { status: 500 }
    );
  }
}