import { NextResponse } from "next/server";

export function middleware(req) {
  console.log(req.cookies);
  const token = req.cookies.get("refreshToken")?.value;
  console.log(req.cookies.get("token")?.value, "token cookie");
  console.log(token, "token in middleware");
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

// import { NextResponse } from "next/server";

// export function proxy(req) {
//   // Check for NextAuth tokens (they have different names in dev vs prod)
//   const nextAuthToken =
//     req.cookies.get("next-auth.session-token")?.value ||
//     req.cookies.get("__Secure-next-auth.session-token")?.value;

//   // If you are manually setting a 'refreshToken', check that too
//   const refreshToken = req.cookies.get("refreshToken")?.value;

//   // Use whichever one represents a "logged in" state for your app
//   const isAuthenticated = nextAuthToken || refreshToken;

//   const { pathname } = req.nextUrl;

//   const isLoginPage = pathname.startsWith("/login");
//   const isVerificationPage = pathname.startsWith("/verify-email");
//   const isPublicAsset = pathname.includes("."); // skips images, etc.

//   // 1. If NOT logged in and trying to access a private page -> Redirect to Login
//   if (
//     !isAuthenticated &&
//     !isLoginPage &&
//     !isVerificationPage &&
//     !isPublicAsset
//   ) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // 2. If logged in and trying to access Login page -> Redirect to Chat/Home
//   if (isAuthenticated && isLoginPage) {
//     return NextResponse.redirect(new URL("/chat", req.url)); // Changed from "/" to "/chat" based on your post
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next|api|static|favicon.ico).*)"],
// };
