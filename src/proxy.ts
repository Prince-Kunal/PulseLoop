import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Enforce role-based access with smart redirection
    if (path.startsWith("/dashboard/donor") && token?.role !== "DONOR") {
      const fallback = token?.role === "HOSPITAL" ? "/dashboard/hospital" : "/dashboard/blood-bank";
      return NextResponse.redirect(new URL(fallback, req.url));
    }
    if (path.startsWith("/dashboard/hospital") && token?.role !== "HOSPITAL") {
      const fallback = token?.role === "DONOR" ? "/dashboard/donor" : "/dashboard/blood-bank";
      return NextResponse.redirect(new URL(fallback, req.url));
    }
    if (path.startsWith("/dashboard/blood-bank") && token?.role !== "BLOOD_BANK") {
      const fallback = token?.role === "DONOR" ? "/dashboard/donor" : "/dashboard/hospital";
      return NextResponse.redirect(new URL(fallback, req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
