import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals + static files
    '/((?!_next|[^?]*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|css|js|json)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
