import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import slideshow from "./slideshow/slideshow";

const app = new Hono();
export const prisma = new PrismaClient();

app.get("/", async (c) => {
  return c.text("Hello, world!");
});

app.route("/slideshow", slideshow);

console.log("Starting server...");
console.log("Listening on port 3000...");
console.log("Press Ctrl+C to stop the server.");
console.log("http://localhost:3000");

const port = (process.env.PORT as unknown as number) || 3000;

serve({
  fetch: app.fetch,
  port,
});

export default app;
