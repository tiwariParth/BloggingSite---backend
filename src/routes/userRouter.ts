import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { signinUser, signupUser } from "@tiwariparth/zod-test";

const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const { success } = await signupUser.safeParseAsync(body);
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
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });
    const JWT = await sign(
      {
        id: user.id,
      },
      c.env?.JWT_SECRET
    );
    c.status(201);
    return c.json({
      message: "Signup successful!",
      token: JWT,
    });
  } catch (error) {
    c.status(400);
    console.log(error);
    return c.json({
      error: "Signup failed!",
    });
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  const { success } = await signinUser.safeParseAsync(body);
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
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
    });
    if (!user) {
      c.status(403);
      return c.json({
        error: "Invalid credentials!",
      });
    }

    const JWT = await sign(
      {
        id: user.id,
      },
      c.env?.JWT_SECRET
    );

    c.status(201);
    return c.json({
      message: "Signin successful!",
      token: JWT,
    });
  } catch (error) {
    c.status(400);
    console.log(error);
    return c.json({
      error: "Signup failed!",
    });
  }
});

export default userRouter;
