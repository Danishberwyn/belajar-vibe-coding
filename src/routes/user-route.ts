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
      name: t.String({ minLength: 1, maxLength: 255, default: 'John Doe' }),
      email: t.String({ format: 'email', maxLength: 255, default: 'john@example.com' }),
      password: t.String({ minLength: 6, maxLength: 255, default: 'password123' })
    }),
    response: {
      201: t.Object({
        data: t.String({ default: 'OK' })
      }),
      400: t.Object({
        error: t.String()
      })
    },
    detail: {
      summary: 'Register User',
      description: 'Mendaftarkan pengguna baru ke sistem.'
    }
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
      email: t.String({ format: 'email', maxLength: 255, default: 'john@example.com' }),
      password: t.String({ minLength: 1, maxLength: 255, default: 'password123' })
    }),
    response: {
      200: t.Object({
        data: t.String({ default: 'uuid-token-string' })
      }),
      401: t.Object({
        error: t.String()
      })
    },
    detail: {
      summary: 'User Login',
      description: 'Melakukan login dan mendapatkan session token.'
    }
  })
  .group("/users", (app) =>
    app
      .derive(({ headers }) => {
        const authHeader = headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return { token: null };
        }

        const token = authHeader.split(" ")[1];
        return { token: token && token.trim() !== "" ? token : null };
      })
      .onBeforeHandle(({ token, set }) => {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
      })
      .get("/current", async ({ token, set }) => {
        const response = await userService.getCurrentUser(token!);
        if (response.error) set.status = 401;
        return response;
      }, {
        response: {
          200: t.Object({
            data: t.Object({
              id: t.Number(),
              name: t.String(),
              email: t.String(),
              createdAt: t.Date()
            })
          }),
          401: t.Object({
            error: t.String()
          })
        },
        detail: {
          summary: 'Get Current User',
          description: 'Mengambil data profil user yang sedang login menggunakan token Bearer.',
          security: [{ bearerAuth: [] }]
        }
      })
      .post("/logout", async ({ token, set }) => {
        const response = await userService.logout(token!);
        if (response.error) set.status = 401;
        return response;
      }, {
        response: {
          200: t.Object({
            data: t.String({ default: 'OK' })
          }),
          401: t.Object({
            error: t.String()
          })
        },
        detail: {
          summary: 'User Logout',
          description: 'Mengakhiri sesi user dengan menghapus token dari database.',
          security: [{ bearerAuth: [] }]
        }
      })
  );
