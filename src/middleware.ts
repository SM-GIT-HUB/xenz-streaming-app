import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

import { ratelimit } from "./lib/ratelimit"

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const isProtectedRoute = createRouteMatcher([
  '/studio(.*)'
])

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

export default clerkMiddleware(async(auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const ip = getIP(req);
  // const { success } = await ratelimit.limit(ip);

  // if (!success) {
  //   return new NextResponse('Too many requests', { status: 429 });
  // }

  return NextResponse.next();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}