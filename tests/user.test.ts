import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/app";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

describe("User API", () => {
  beforeEach(async () => {
    // Menghapus data agar sesi test konsisten sesuai permintaan issue
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("POST /api/users (Register)", () => {
    it("harus berhasil mendaftar user baru", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Danish",
            email: "danish@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.data).toBe("OK");
    });

    it("harus gagal jika email sudah terdaftar", async () => {
      // Daftar pertama
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User 1",
            email: "duplicate@example.com",
            password: "password123",
          }),
        })
      );

      // Daftar kedua dengan email sama
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User 2",
            email: "duplicate@example.com",
            password: "password456",
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Email sudah terdaftar");
    });

    it("harus gagal jika validasi TypeBox tidak terpenuhi (format email salah)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Danish",
            email: "invalid-email",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
    });

    it("harus gagal jika nama melebihi 255 karakter", async () => {
      const longName = "a".repeat(300);
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: longName,
            email: "long@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/users/login", () => {
    it("harus berhasil login dan mendapatkan token", async () => {
      // Register dulu
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Danish",
            email: "login@example.com",
            password: "password123",
          }),
        })
      );

      // Login
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(typeof body.data).toBe("string");
    });

    it("harus gagal jika email tidak terdaftar", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "notfound@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Email atau password salah");
    });

    it("harus gagal jika password salah", async () => {
      // Register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Danish",
            email: "wrongpass@example.com",
            password: "password123",
          }),
        })
      );

      // Login dengan pass salah
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "wrongpass@example.com",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/users/current", () => {
    it("harus berhasil mendapatkan data user saat ini", async () => {
      const email = "current@example.com";
      // Register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Danish Current",
            email,
            password: "password123",
          }),
        })
      );

      // Login untuk dapat token
      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: "password123" }),
        })
      );
      const { data: token } = await loginRes.json();

      // Get Current User
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.email).toBe(email);
      expect(body.data.password).toBeUndefined(); // Password tidak boleh keluar
    });

    it("harus gagal jika tidak ada header authorization", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("harus gagal jika format Bearer salah", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: "Token invalid-format" },
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/users/logout", () => {
    it("harus berhasil logout dan menghapus sesi", async () => {
      const email = "logout@example.com";
      // Register & Login
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Logout User", email, password: "password123" }),
        })
      );
      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: "password123" }),
        })
      );
      const { data: token } = await loginRes.json();

      // Logout
      const logoutRes = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(logoutRes.status).toBe(200);

      // Verifikasi token tidak bisa dipakai lagi
      const currentRes = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(currentRes.status).toBe(401);
    });

    it("harus gagal logout jika token tidak valid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "POST",
          headers: { Authorization: "Bearer invalid-token" },
        })
      );

      expect(response.status).toBe(401);
    });
  });
});
