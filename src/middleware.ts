import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";

export function middleware(req: NextRequest) {
  const sessionValue = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;

  // If no admin password is configured, leave the panel open (local/dev use).
  if (!sessionValue) return NextResponse.next();

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookie === sessionValue) return NextResponse.next();

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin"],
};
