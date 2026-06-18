import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const adminPrefix = "/admin";
const clientPrefix = "/cliente";
const buyerPrefixes = ["/catalogo", "/producto", "/carrito", "/pedido-confirmado", "/mis-pedidos"];
const accountPrefix = "/mi-cuenta";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const isProtected =
    pathname.startsWith(adminPrefix) ||
    pathname.startsWith(clientPrefix) ||
    pathname.startsWith(accountPrefix) ||
    buyerPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith(adminPrefix) && token.role !== "SUPER_ADMIN_EXPOTECH") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith(clientPrefix) && token.role !== "CLIENT_ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith(accountPrefix) && token.role !== "BUYER") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (buyerPrefixes.some((prefix) => pathname.startsWith(prefix)) && token.role !== "BUYER") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cliente/:path*",
    "/mi-cuenta/:path*",
    "/catalogo/:path*",
    "/producto/:path*",
    "/carrito/:path*",
    "/pedido-confirmado/:path*",
    "/mis-pedidos/:path*"
  ]
};
