import { type NextRequest, NextResponse } from "next/server";

// Simple middleware - auth protection is handled client-side with Django JWT
export default async function proxy(request: NextRequest) {
  // Protected routes that require authentication
  const protectedPaths = ["/seller", "/admin", "/boda", "/checkout", "/orders", "/account"];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // For protected paths, check if user has a token
  // The actual validation happens when API calls are made
  // Here we just do a basic check for the presence of auth data
  if (isProtectedPath) {
    // Check for access token in cookies or let client-side handle it
    const hasToken = request.cookies.get("access_token");
    
    // If no token and trying to access protected route, redirect to login
    // But we'll let client-side auth handle most cases for better UX
    if (!hasToken) {
      // We'll let client-side auth context handle redirects for most cases
      // Only redirect if it's a direct navigation (not API call)
      const acceptHeader = request.headers.get("accept") || "";
      if (acceptHeader.includes("text/html")) {
        // This is a page navigation, not an API call
        // Let client-side handle it for now
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
