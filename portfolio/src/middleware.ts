import { NextRequest, NextResponse } from "next/server";

/**
 * The admin panel and its API write files and run git, so they must only ever be
 * reachable from a browser on this machine while `next dev` is running.
 */
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function hostnameOf(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  try {
    return new URL(`http://${hostHeader}`).hostname;
  } catch {
    return null;
  }
}

function forbidden(reason: string) {
  return NextResponse.json({ error: "Forbidden", reason }, { status: 403 });
}

export function middleware(request: NextRequest) {
  // Never expose admin in production builds or on Vercel, regardless of build tooling.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Reject requests addressed to anything but localhost (LAN access, DNS rebinding).
  const host = request.headers.get("host");
  const hostname = hostnameOf(host);
  if (!hostname || !LOCAL_HOSTNAMES.has(hostname)) {
    return forbidden("Admin is only available on localhost");
  }

  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    // Browsers label cross-site requests; block anything not initiated by this origin.
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
      return forbidden("Cross-site admin requests are not allowed");
    }

    // Browsers always send Origin on cross-origin POST/PUT/DELETE; it must match this server.
    const origin = request.headers.get("origin");
    if (origin) {
      let originHost: string | null = null;
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = null;
      }
      if (originHost !== host) {
        return forbidden("Origin mismatch");
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
