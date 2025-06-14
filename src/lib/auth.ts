import { findUser } from "./users";
import bcrypt from "bcryptjs";

export async function authenticateUser(username: string, password: string) {
  const user = findUser(username);
  if (!user) return false;

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
}
