import { NextRequest, NextResponse } from 'next/server';
import { cancelarAgendamento } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const usuarioId = req.headers.get('x-user-id');
    if (!usuarioId) return NextResponse.json({ ok: false, erro: 'Não autenticado.' }, { status: 401 });
    const result = await cancelarAgendamento(Number(id), Number(usuarioId));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, erro: 'Erro interno.' }, { status: 500 });
  }
}
