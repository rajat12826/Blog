// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/features/middle";

export async function GET(request: NextRequest) {
  const user = await authorize(request); // You can pass role like authorize(request, "ADMIN")
// console.log(request);

  // If authorize() returns a response, it's an error — return it
  if (user instanceof NextResponse) return user;

  console.log(user);
  return NextResponse.json({ user });
}
