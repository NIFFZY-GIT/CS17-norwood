export type User = {
  username: string;
  password: string;
};

const users: User[] = [];

export function registerUser(user: User) {
  users.push(user);
}

export function findUser(username: string): User | undefined {
  return users.find((u) => u.username === username);
}
