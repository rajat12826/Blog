import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    
    const blogs = await prisma.blog.findMany({
      where: {
        authorId: id,
       
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching blogs" }, { status: 500 });
  }
}
