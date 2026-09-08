import { NextRequest, NextResponse } from 'next/server';
import { autenticar } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();
    const result = await autenticar(email, senha);
    if (result.ok && result.usuario) {
      const token = createToken(result.usuario.id, result.usuario.perfil);
      return NextResponse.json({ ok: true, usuario: result.usuario, token });
    }
    return NextResponse.json({ ok: false, erro: result.erro }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: 'Erro interno.' }, { status: 500 });
  }
}
