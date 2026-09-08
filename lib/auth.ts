import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'fallback_secret';

export type SessionPayload = {
  userId: number;
  perfil: string;
  exp: number;
};

export function createToken(userId: number, perfil: string): string {
  const payload: SessionPayload = {
    userId,
    perfil,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
