import { NextRequest, NextResponse } from 'next/server';
import { cadastrar } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha } = await req.json();
    const result = await cadastrar(nome, email, senha, 'cidadao');
    if (result.ok) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, erro: result.erro }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: 'Erro interno.' }, { status: 500 });
  }
}
