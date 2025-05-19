import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function extractIdFromUrl(url: string): string | null {
  const segments = url.split("/");
  return segments[segments.length - 1] || null;
}

// GET handler
export async function GET(req: NextRequest) {
  const id = extractIdFromUrl(req.url);

  if (!id) {
    return NextResponse.json({ message: "Missing blog ID" }, { status: 400 });
  }

  try {
    const blog = await prisma.blog.findUnique({
      where: { id: Number(id) },
    });

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching blog" }, { status: 500 });
  }
}

// DELETE handler
export async function DELETE(req: NextRequest) {
  const id = extractIdFromUrl(req.url);

  if (!id) {
    return NextResponse.json({ message: "Missing blog ID" }, { status: 400 });
  }

  try {
    const blog = await prisma.blog.findUnique({
      where: { id: Number(id) },
    });

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    await prisma.blog.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting blog" }, { status: 500 });
  }
}
