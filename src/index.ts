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

const port = (process.env.PORT as unknown as number) || 3000;

console.log("Starting server...");
console.log("Listening on port " + port);
console.log("Press Ctrl+C to stop the server.");
console.log("http://localhost:" + port);

serve({
  fetch: app.fetch,
  port,
});

export default app;
