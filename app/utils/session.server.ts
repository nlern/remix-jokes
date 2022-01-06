import bcrypt from "bcryptjs";
import { db } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

export async function login({ username, password }: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) return null;

  const isCorrectpassword = bcrypt.compare(password, user.passwordHash);
  if (!isCorrectpassword) return null;

  return user;
}