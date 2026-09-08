import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/cadastro'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/')) {
    if (PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.next();
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, erro: 'Não autenticado.' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ ok: false, erro: 'Sessão expirada ou inválida.' }, { status: 401 });
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', String(payload.userId));
    requestHeaders.set('x-user-perfil', payload.perfil);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
