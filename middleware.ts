import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/about",
    "/api/health",
  ]

  // Protected routes that require authentication
  const protectedRoutes = [
    "/ask",
    "/ai-agent",
    "/profile",
    "/doubts",
    "/community",
    "/courses",
    "/feed",
    "/happenings",
    "/leaderboard",
    "/mentorship",
    "/search",
    "/subscription",
  ]

  // API routes that require authentication
  const protectedApiRoutes = [
    "/api/ai-agent",
    "/api/credits",
    "/api/doubts",
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))

  // Check if the current path requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  // Get the token for authentication check
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect unauthenticated users trying to access protected routes
  if ((isProtectedRoute || isProtectedApiRoute) && !token) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users away from auth pages
  if ((pathname.startsWith("/auth/") || pathname === "/auth") && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Add security headers for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    // Security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

    // Rate limiting headers (you can implement rate limiting logic here)
    response.headers.set("X-RateLimit-Limit", "100")
    response.headers.set("X-RateLimit-Remaining", "99")
    response.headers.set("X-RateLimit-Reset", new Date(Date.now() + 60000).toISOString())

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
