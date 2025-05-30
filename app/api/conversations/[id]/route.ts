import { prisma } from '@/src/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/conversations/[id]
export async function GET(_: NextRequest, { params }: Params) {
  const conversationId = Number(params.id);

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { Message: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    const messages = conversation.Message.map((msg) => ({
      sender: msg.sender,
      content: msg.content,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error al obtener conversación:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE /api/conversations/[id]
export async function DELETE(_: NextRequest, { params }: Params) {
  const conversationId = Number(params.id);

  try {
    // Primero eliminamos los mensajes
    await prisma.message.deleteMany({
      where: { conversationId },
    });

    // Luego eliminamos la conversación
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json({ message: 'Conversación eliminada' });
  } catch (error) {
    console.error('Error al eliminar conversación:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
