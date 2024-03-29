import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { createBlog, updateBlog } from "@tiwariparth/zod-test";

const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("Authorization") || "";
  try{
    const user = await verify(authHeader, c.env?.JWT_SECRET);
    if (user) {
      c.set("userId", user.id);
      await next();
    }
  }
  catch (error) {
    c.status(401);
    return c.json({
      error: "Unauthorized",
    });
  }
});

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { success } = await createBlog.safeParseAsync(body);
  if (!success) {
    c.status(400);
    return c.json({
      error: "Invalid data!",
    });
  }
  const authorId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId),
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
  const { success } = await updateBlog.safeParseAsync(body);
  if (!success) {
    c.status(400);
    return c.json({
      error: "Invalid data!",
    });
  }
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

blogRouter.get("/get/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.post.findFirst({
      where: {
        id: Number(id),
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

blogRouter.get("/bulk", async (c) => {
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
