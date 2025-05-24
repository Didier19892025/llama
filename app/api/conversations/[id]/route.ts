import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const conversationId = params.id;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error al obtener conversación:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
