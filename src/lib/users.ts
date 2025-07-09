// Example structure for your user object
export type User = {
  id: string; // <-- This is required!
  username: string;
  password: string; // Hashed password
  email: string;
};

// Mock user database
const users: User[] = [
  { id: 'user-uuid-12345', username: 'testuser', password: '...', email: 'test@example.com' }
];

export function findUser(username: string): User | undefined {
  return users.find(user => user.username === username);
}