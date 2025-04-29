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

    
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    
    // Convertir la respuesta a JSON
    const data = await response.json();
    
    // Devolver la respuesta
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en la ruta API:", error);
    
    // Manejar diferentes tipos de errores
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          status: "bad",
          answer: "Sorry, I couldn't connect to the server. Please check your internet connection or try again later."
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        status: "bad",
        answer: "An error occurred while processing your request. Please try again later."
      },
      { status: 500 }
    );
  }
}