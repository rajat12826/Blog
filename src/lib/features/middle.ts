// lib/authorize.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../jwt";// your token verification logic

export async function authorize(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
console.log(authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized: Missing token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const decoded = await verifyToken(token);
 
  console.log("Decoded Token:", decoded); // Should be { id: "UUID...", email: ... }
  
//  console.log(decoded);
 

  return decoded; // return decoded user object
}
