import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const db = new Database('orders.db');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    pi_number TEXT NOT NULL,
    etd DATE NOT NULL,
    eta DATE NOT NULL,
    payment_terms TEXT NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// User schema
const UserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Order schema
const OrderSchema = z.object({
  company_name: z.string().min(1),
  pi_number: z.string().min(1),
  etd: z.string(),
  eta: z.string(),
  payment_terms: z.enum(['T/T', 'DA', 'DP', 'LC', 'LC/T/T']),
  user_id: z.number(),
});

export type User = z.infer<typeof UserSchema>;
export type Order = z.infer<typeof OrderSchema>;

export const db_operations = {
  createUser: (userData: User) => {
    const { username, password } = UserSchema.parse(userData);
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    return stmt.run(username, hashedPassword);
  },

  verifyUser: (username: string, password: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);
    
    if (!user) return null;
    const validPassword = bcrypt.compareSync(password, user.password);
    return validPassword ? user : null;
  },

  createOrder: (orderData: Order) => {
    const order = OrderSchema.parse(orderData);
    const stmt = db.prepare(`
      INSERT INTO orders (company_name, pi_number, etd, eta, payment_terms, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      order.company_name,
      order.pi_number,
      order.etd,
      order.eta,
      order.payment_terms,
      order.user_id
    );
  },

  getUserOrders: (userId: number) => {
    const stmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  }
};
