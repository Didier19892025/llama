import { prisma } from '@/src/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, messages } = body;

    if (!userId || !title || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Crear conversación
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title,
        messages: {
          create: messages.map((msg: { sender: string; content: string }) => ({
            sender: msg.sender,
            content: msg.content,
          })),
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Error guardando conversación:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}