import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedPaths = ["/dash", "/dashboard"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (!isProtected) return NextResponse.next();

  // Only check for cookie presence, not verify
  const sessionCookie = request.cookies.get("session")?.value;
  if (!sessionCookie) {
    if (path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dash/:path*", "/dashboard/:path*", "/dashboard"],
};
