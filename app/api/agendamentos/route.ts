import { NextRequest, NextResponse } from 'next/server';
import { criarAgendamento, listarAgendamentosUsuario } from '@/lib/db';

export async function GET(req: NextRequest) {
  const usuarioId = req.headers.get('x-user-id');
  if (!usuarioId) return NextResponse.json({ ok: false, erro: 'Não autenticado.' }, { status: 401 });
  const rows = await listarAgendamentosUsuario(Number(usuarioId));
  return NextResponse.json({ ok: true, agendamentos: rows });
}

export async function POST(req: NextRequest) {
  try {
    const usuarioId = req.headers.get('x-user-id');
    if (!usuarioId) return NextResponse.json({ ok: false, erro: 'Não autenticado.' }, { status: 401 });
    const dados = await req.json();
    const result = await criarAgendamento(Number(usuarioId), dados);
    if (result.ok) return NextResponse.json({ ok: true, id: result.id });
    return NextResponse.json({ ok: false, erro: result.erro }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: 'Erro interno.' }, { status: 500 });
  }
}
