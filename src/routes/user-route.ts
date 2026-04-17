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
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  });
