import { Elysia, t } from "elysia";
import { userService } from "../services/user-services";

export const userRoute = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    const response = await userService.register(body);

    if (response.error) {
      set.status = 400; // Bad Request
      return response;
    }

    set.status = 201; // Created
    return response;
  }, {
    body: t.Object({
      name: t.String({ minLength: 1, maxLength: 255 }),
      email: t.String({ format: 'email', maxLength: 255 }),
      password: t.String({ minLength: 6, maxLength: 255 })
    })
  })
  .post("/users/login", async ({ body, set }) => {
    const response = await userService.login(body);

    if (response.error) {
      set.status = 401; // Unauthorized
      return response;
    }

    return response;
  }, {
    body: t.Object({
      email: t.String({ format: 'email', maxLength: 255 }),
      password: t.String({ minLength: 1, maxLength: 255 })
    })
  })
  .get("/users/current", async ({ headers, set }) => {
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const token = authHeader.split(" ")[1];
    const response = await userService.getCurrentUser(token);

    if (response.error) {
      set.status = 401;
      return response;
    }

    return response;
  });
