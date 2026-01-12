import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || "";

    // Check if we are on the management subdomain
    // Adjust this check based on your actual domain setup
    // For local development, you might map 'app.localhost' in hosts file
    const isManagementSubdomain = hostname.startsWith("app.");

    if (isManagementSubdomain) {
        // Rewrite requests to the /management internal path
        // preserves the URL in the browser but serves content from app/(management)/management
        return NextResponse.rewrite(new URL(`/management${url.pathname === "/" ? "" : url.pathname}`, req.url));
    }

    // For the main site, we don't need to rewrite if (site) is at root, 
    // but if we had strict path separation we might needed to rewrite to /(site).
    // Since 'page.tsx' in (site) maps to /, we typically do nothing here.

    return NextResponse.next();
}
