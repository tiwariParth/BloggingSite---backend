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

blogRouter.get("/:id", (c) => {
  const id = c.req.param("id");
  console.log(id);
  return c.text("get blog route");
});

blogRouter.post("/", (c) => {
  return c.text("signin route");
});

blogRouter.put("/", (c) => {
  return c.text("signin route");
});

export default blogRouter;
