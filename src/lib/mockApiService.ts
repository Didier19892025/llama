// lib/mockApiService.ts

// Tipo para la respuesta de la API
export interface ApiResponse {
    status: 'good' | 'bad' | 'time_out';
    answer: string;
  }
  
  // Simulación de respuestas para diferentes tipos de preguntas
  const mockResponses: Record<string, ApiResponse> = {
    // Respuestas generales
    "saludo": {
      status: "good",
      answer: "¡Hola! Soy Yama, tu asistente virtual. ¿En qué puedo ayudarte hoy?"
    },
    "ayuda": {
      status: "good",
      answer: "Puedo ayudarte con información sobre productos, servicios, soporte técnico y más. ¿Qué necesitas específicamente?"
    },
    "gracias": {
      status: "good",
      answer: "De nada. Estoy aquí para ayudarte cuando lo necesites."
    },
    
    // Respuestas sobre productos
    "productos": {
      status: "good",
      answer: "Ofrecemos soluciones en la nube, software personalizado, servicios de consultoría IT y soluciones de ciberseguridad. ¿Te gustaría más información sobre alguno de estos productos?"
    },
    "precios": {
      status: "good",
      answer: "Los precios varían según el plan y las características que necesites. Por favor, contacta con nuestro equipo de ventas para obtener una cotización personalizada."
    },
    
    // Respuestas sobre soporte
    "soporte": {
      status: "good",
      answer: "Nuestro equipo de soporte está disponible 24/7. Puedes contactarnos por teléfono al +1-234-567-8900 o por email a soporte@cloudware.com.co"
    },
    "problema": {
      status: "good",
      answer: "Lamento que estés teniendo problemas. Para poder ayudarte mejor, necesitaría más detalles sobre el inconveniente que estás experimentando."
    },
    
    // Respuestas de error
    "error": {
      status: "bad",
      answer: "Lo siento, no pude procesar tu solicitud correctamente. Por favor, intenta reformular tu pregunta."
    },
    "timeout": {
      status: "time_out",
      answer: "La solicitud ha tardado demasiado tiempo. Por favor, inténtalo de nuevo más tarde."
    }
  };
  
  // Función que simula un retraso aleatorio para simular latencia de red
  const randomDelay = (): number => {
    return Math.floor(Math.random() * 1000) + 500; // entre 500ms y 1500ms
  };
  
  // Función para encontrar la coincidencia más cercana en nuestras respuestas predefinidas
  const findBestMatch = (query: string): ApiResponse => {
    query = query.toLowerCase();
    
    // Intentamos encontrar una coincidencia directa
    for (const [key, response] of Object.entries(mockResponses)) {
      if (query.includes(key)) {
        return response;
      }
    }
    
    // Si el mensaje es muy corto, podría ser difícil de interpretar
    if (query.length < 3) {
      return {
        status: "bad",
        answer: "Tu mensaje es demasiado corto. ¿Podrías proporcionar más detalles sobre lo que necesitas?"
      };
    }
    
    // Si la consulta es muy larga, simulamos un timeout ocasionalmente
    if (query.length > 100 && Math.random() < 0.3) {
      return mockResponses.timeout;
    }
    
    // Respuesta genérica cuando no hay coincidencias
    return {
      status: "good",
      answer: "Entiendo tu consulta sobre \"" + query + "\". Para darte una respuesta más precisa, ¿podrías proporcionar más detalles o reformular tu pregunta?"
    };
  };
  
  // Simula una llamada a la API
  export async function mockFetchAnswer(query: string): Promise<ApiResponse> {
    return new Promise((resolve) => {
      // Agregamos un retraso aleatorio para simular el tiempo de respuesta de la API
      setTimeout(() => {
        // 10% de probabilidad de error de conexión para simular problemas de red
        if (Math.random() < 0.1) {
          resolve({
            status: "bad",
            answer: "Ha ocurrido un error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo."
          });
          return;
        }
        
        // 5% de probabilidad de timeout
        if (Math.random() < 0.05) {
          resolve(mockResponses.timeout);
          return;
        }
        
        // Encontrar la mejor respuesta para la consulta
        const response = findBestMatch(query);
        resolve(response);
      }, randomDelay());
    });
  }