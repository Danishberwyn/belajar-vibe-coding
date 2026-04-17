import { Elysia } from "elysia";
import { userRoute } from "./routes/user-route";

const app = new Elysia()
  .get("/", () => ({
    status: "ok",
    message: "Server is running perfectly!",
    timestamp: new Date().toISOString(),
  }))
  .use(userRoute)
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
