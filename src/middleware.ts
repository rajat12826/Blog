// middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const url = new URL(request.url);

  if (url.pathname === "/") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
