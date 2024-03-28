import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";

const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: 1,
      },
    });

    c.status(201);
    return c.json({
      message: "Blog created successfully!",
      blog: blog.id,
    });
  } catch (error) {
    c.status(400);
    console.log(error);
    return c.json({
      error: "Blog creation failed!",
    });
  }
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    c.status(201);
    return c.json({
      message: "Blog updated successfully!",
      blog: blog.id,
    });
  } catch (error) {
    c.status(400);
    console.log(error);
    return c.json({
      error: "Blog updation failed!",
    });
  }
});

blogRouter.get("/:id", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.post.findFirst({
      where: {
        id: body.id,
      },
    });

    c.status(201);
    return c.json({
      message: "Blog found",
      blog: blog,
    });
  } catch (error) {
    c.status(400);
    console.log(error);
    return c.json({
      error: "Blog not found",
    });
  }
});

blogRouter.get("/", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
     const blog = await prisma.post.findMany();
  
      c.status(201);
      return c.json({
        message: "Blog found",
        blog: blog,
      });
    } catch (error) {
      c.status(400);
      console.log(error);
      return c.json({
        error: "Blog not found",
      });
    }
  });


export default blogRouter;
