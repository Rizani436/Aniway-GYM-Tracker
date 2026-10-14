import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware cepat tanpa network call:
 * - Verifikasi keberadaan & masa berlaku JWT auth Supabase secara LOKAL (decode payload saja).
 * - Otorisasi sesungguhnya tetap dilakukan server-side oleh `getAuthenticatedUser()` /
 *   `requireUser()` di server actions, jadi cookie palsu tidak memberi akses data apa pun.
 */

function getSessionJwtFromCookies(
  all: Array<{ name: string; value: string }>
): string | null {
  const base = all.filter(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  );

  const main = base.find((c) => c.name.endsWith('-auth-token'));
  if (main) {
    try {
      const parsed = JSON.parse(main.value);
      return typeof parsed?.access_token === 'string' ? parsed.access_token : null;
    } catch {
      return null;
    }
  }

  // Cookie ter-chunk (sb-xxx-auth-token.0, .1, ...)
  const chunks = base.filter((c) => /\.(\d+)$/.test(c.name));
  if (chunks.length > 0) {
    try {
      const sorted = chunks.sort(
        (a, b) =>
          Number(a.name.match(/\.(\d+)$/)![1]) - Number(b.name.match(/\.(\d+)$/)![1])
      );
      const joined = sorted.map((c) => c.value).join('');
      // Chunk bisa berupa JSON mentah atau base64 dari JSON
      let raw = joined;
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed?.access_token === 'string' ? parsed.access_token : null;
      } catch {
        raw = atob(joined);
        const parsed = JSON.parse(raw);
        return typeof parsed?.access_token === 'string' ? parsed.access_token : null;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function isJwtExpired(jwt: string): boolean {
  try {
    const payloadPart = jwt.split('.')[1];
    if (!payloadPart) return true;
    const payload = JSON.parse(
      atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (!payload?.exp) return true;
    // Toleransi 30 detik clock skew
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/auth');
  const isPublicAsset =
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/_next');

  if (isPublicAsset || isAuthPage) {
    return NextResponse.next();
  }

  const allCookies = request.cookies.getAll();
  const jwt = getSessionJwtFromCookies(allCookies);

  // Tidak ada cookie auth sama sekali -> redirect ke login tanpa network call
  if (!jwt) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Cookie ada tapi token kedaluwarsa -> paksa re-login (refresh terjadi di /login)
  if (isJwtExpired(jwt)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Token lokal valid -> langsung lolos, nol roundtrip jaringan
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
