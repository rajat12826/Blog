import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {  id,title, content, tags,author } = body;

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required to publish" },
        { status: 400 }
      );
    }
console.log("author",author);

    let blog;

    // if (id) {
      const existingBlog = await prisma.blog.findUnique({ where: { id:Number(id) } });

  

    if(existingBlog){
      blog = await prisma.blog.update({
        where: { id :Number(id)},
        data: {
          title,
          content,
          tags,
          status: "published",
        },
      });
    }
    else {
      blog = await prisma.blog.create({
        data: {
          title,
          content,
          tags,
          status: "published",
          author: {
            connect: {
              id:  author// The user's UUID string
            }
          }
        },
      });
    }
    // } 

    return NextResponse.json(blog, { status:existingBlog? 200 :201});
  } catch (error) {
    console.error("Error publishing blog:", error);
    return NextResponse.json(
      { message: "Error publishing blog" },
      { status: 500 }
    );
  }
}
