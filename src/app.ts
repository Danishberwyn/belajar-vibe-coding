import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoute } from "./routes/user-route";

export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Belajar Vibe Coding API',
        version: '1.0.0',
        description: 'API Documentation untuk project Belajar Vibe Coding'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  }))
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        type: "validation",
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
