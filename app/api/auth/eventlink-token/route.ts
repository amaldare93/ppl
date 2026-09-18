import { NextResponse } from "next/server";

const TOKEN_COOKIE = "eventlink_auth_token";

export async function POST(request: Request) {
  const { token } = (await request.json()) as { token?: unknown };

  if (typeof token !== "string" || !token.trim()) {
    return NextResponse.json(
      { error: "A token is required." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ saved: true });
  response.cookies.set(TOKEN_COOKIE, token.trim(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
