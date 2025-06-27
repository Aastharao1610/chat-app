import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;

  const isLoginPage = pathname.startsWith("/login");
  const isVerificationPage = pathname.startsWith("/verify-email");

  if (!token && !isLoginPage && !isVerificationPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
