import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, content, tags, author } = body;

    // Validate required fields
    if (!title || !author) {
      return NextResponse.json(
        { message: "Title and author are required to save draft" },
        { status: 400 }
      );
    }

    let blog;

    // If ID is provided, attempt to update existing draft
    if (id) {
      const existingBlog = await prisma.blog.findUnique({
        where: { id: Number(id) },
      });

      if (existingBlog) {
        blog = await prisma.blog.update({
          where: { id: Number(id) },
          data: {
            title,
            content,
            tags,
            status: "savedraft",
            author: {
              connect: { id: author },
            },
          },
        });
        return NextResponse.json(blog, { status: 200 });
      }
    }

    // Create new draft
    blog = await prisma.blog.create({
      data: {
        title,
        content,
        tags,
        status: "savedraft",
        author: {
          connect: { id: author },
        },
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json({ message: "Error saving draft" }, { status: 500 });
  }
}
