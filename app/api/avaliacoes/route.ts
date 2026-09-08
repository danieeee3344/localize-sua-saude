import { NextRequest, NextResponse } from 'next/server';
import { criarAvaliacao } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const usuarioId = req.headers.get('x-user-id');
    if (!usuarioId) return NextResponse.json({ ok: false, erro: 'Não autenticado.' }, { status: 401 });
    const { unidadeId, nota, comentario } = await req.json();
    const result = await criarAvaliacao(Number(usuarioId), unidadeId, Number(nota), comentario);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, erro: 'Erro interno.' }, { status: 500 });
  }
}
