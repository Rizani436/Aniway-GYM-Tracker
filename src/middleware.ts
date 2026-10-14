import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware cepat:
 * - Fast path (mayoritas request): decode JWT auth Supabase secara LOKAL dari cookie.
 *   Nol roundtrip jaringan.
 * - Token kedaluwarsa / gagal decode: fallback ke getUser() Supabase yang sekaligus
 *   me-REFRESH token (cookie baru ditulis ke response) — sesi user tidak dibuang.
 * - Otorisasi data tetap diverifikasi server-side oleh getAuthenticatedUser()/requireUser().
 */

function extractAccessToken(cookieValue: string): string | null {
  let raw = cookieValue;

  // @supabase/ssr v0.5.x (cookieEncoding "base64url", default):
  // nilai cookie = "base64-" + base64url(JSON). Buang prefix-nya dulu.
  if (raw.startsWith('base64-')) {
    raw = raw.slice('base64-'.length);
  }

  // 1. JSON langsung (cookieEncoding: 'json')
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.access_token === 'string') return parsed.access_token;
  } catch {
    // lanjut ke percobaan berikutnya
  }

  // 2. Base64/Base64URL decode -> JSON
  try {
    const std = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = std + '='.repeat((4 - (std.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    if (typeof decoded?.access_token === 'string') return decoded.access_token;
  } catch {
    // bukan format yang dikenal
  }

  return null;
}

function getSessionJwtFromCookies(
  all: Array<{ name: string; value: string }>
): string | null {
  const base = all.filter(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  );

  // Cookie utama: sb-<ref>-auth-token
  const main = base.find((c) => c.name.endsWith('-auth-token'));
  if (main) {
    return extractAccessToken(main.value);
  }

  // Cookie ter-chunk: sb-<ref>-auth-token.0, .1, ...
  const chunks = base.filter((c) => /\.(\d+)$/.test(c.name));
  if (chunks.length > 0) {
    const sorted = chunks.sort(
      (a, b) =>
        Number(a.name.match(/\.(\d+)$/)![1]) - Number(b.name.match(/\.(\d+)$/)![1])
    );
    return extractAccessToken(sorted.map((c) => c.value).join(''));
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

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/auth');
  const isPublicAsset =
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/icons');

  if (isPublicAsset || isAuthPage) {
    return supabaseResponse;
  }

  const jwt = getSessionJwtFromCookies(request.cookies.getAll());

  // Fast path: token ada & masih berlaku -> lolos tanpa sentuh jaringan
  if (jwt && !isJwtExpired(jwt)) {
    return supabaseResponse;
  }

  // Token tidak ada sama sekali -> belum login, redirect tanpa network call
  if (!jwt) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Token ada tapi kedaluwarsa / format tak dikenal -> verifikasi & refresh via Supabase Auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Sesi valid & cookie refresh sudah ditulis ke supabaseResponse
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
