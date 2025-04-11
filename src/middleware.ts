import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/", "/favicon.ico", "/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // For debugging
    console.log("Middleware: URL path:", req.nextUrl.pathname);
    console.log("Middleware: userId:", userId);

    // If the user isn't signed in and the route is private, protect it
    if (!userId && !isPublicRoute(req)) {
        console.log("Middleware: User not signed in, protecting route");
        await auth.protect();
    }

    // If we've reached here, user is authenticated or accessing a public route
    // Simply allow access without checking onboarding status
    console.log("Middleware: Allowing access to route");
    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
