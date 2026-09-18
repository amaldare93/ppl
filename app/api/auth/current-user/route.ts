import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/apollo-client";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[current-user] Unable to load current user", error);
    return NextResponse.json(
      { error: "Unable to load the current user." },
      { status: 500 },
    );
  }
}
