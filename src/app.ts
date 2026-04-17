import { Elysia } from "elysia";
import { userRoute } from "./routes/user-route";

export const app = new Elysia()
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        type: "validation",
        on: error.on,
        summary: error.summary,
        message: error.message,
        errors: error.all
      };
    }
  })
  .get("/", () => ({
    status: "ok",
    message: "Server is running perfectly!",
    timestamp: new Date().toISOString(),
  }))
  .use(userRoute);
