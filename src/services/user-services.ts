import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const userService = {
  /**
   * Mendaftarkan pengguna baru ke dalam sistem.
   * Fungsi ini akan mengecek apakah email sudah terdaftar, 
   * melakukan hashing pada password, dan menyimpan data pengguna ke database.
   * 
   * @param payload - Obyek yang berisi name, email, dan password dari pengguna.
   * @returns Obyek dengan data "OK" jika berhasil, atau pesan error jika gagal.
   */
  async register(payload: any) {
    // ... (existing register code)
    const { name, email, password } = payload;

    // 1. Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: "Email sudah terdaftar" };
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user into database
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return { data: "OK" };
  },

  /**
   * Melakukan proses otentikasi (login) pengguna.
   * Fungsi ini akan mengecek kecocokan email dan password, 
   * kemudian membuatkan sesi (session token) jika valid.
   * 
   * @param payload - Obyek yang berisi email dan password dari pengguna.
   * @returns Obyek dengan data session token jika berhasil, atau pesan error jika gagal.
   */
  async login(payload: any) {
    const { email, password } = payload;

    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return { error: "Email atau password salah" };
    }

    // 2. Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return { error: "Email atau password salah" };
    }

    // 3. Generate token
    const token = crypto.randomUUID();

    // 4. Create session
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return { data: token };
  },

  /**
   * Mengambil data profil dari pengguna yang sedang aktif (berdasarkan token sesi).
   * Menghubungkan tabel sessions dengan tabel users untuk mendapatkan detail user.
   * 
   * @param token - Token sesi (session token) dari pengguna yang login.
   * @returns Obyek berisi data profil pengguna (tanpa password) atau pesan error jika tidak sah.
   */
  async getCurrentUser(token: string) {
    const [result] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    if (!result) {
      return { error: "Unauthorized" };
    }

    return { data: result };
  },

  /**
   * Mengakhiri sesi pengguna (logout).
   * Fungsi ini akan menghapus data sesi (token) dari database sehingga token tersebut tidak lagi valid.
   * 
   * @param token - Token sesi (session token) yang akan dihapus.
   * @returns Obyek dengan data "OK" jika berhasil, atau pesan error jika token tidak ditemukan.
   */
  async logout(token: string) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      return { error: "Unauthorized" };
    }

    await db.delete(sessions).where(eq(sessions.token, token));

    return { data: "OK" };
  },
};
