/**
 * VibeMart — In-Memory Mock Database
 * 
 * Uses plain JavaScript arrays/objects to simulate a SQL database.
 * This avoids any native module dependencies (no better-sqlite3 needed).
 * 
 * IMPORTANT: The query() method intentionally uses string interpolation
 * to simulate real SQL injection vulnerabilities for Cyphex testing.
 */

// ── Seed Data ──
const users = [
  { id: 1, username: 'admin',   password: 'admin123',     email: 'admin@vibemart.io',  role: 'admin' },
  { id: 2, username: 'alice',   password: 'alice2025',    email: 'alice@example.com',  role: 'user' },
  { id: 3, username: 'bob',     password: 'bobsecure',    email: 'bob@example.com',    role: 'user' },
  { id: 4, username: 'charlie', password: 'charlie!pass', email: 'charlie@test.com',   role: 'user' },
];

const products = [
  { id: 1, name: 'Wireless Headphones',  price: 79.99,  category: 'electronics', stock: 45 },
  { id: 2, name: 'USB-C Hub',            price: 34.99,  category: 'electronics', stock: 120 },
  { id: 3, name: 'Mechanical Keyboard',  price: 129.99, category: 'electronics', stock: 30 },
  { id: 4, name: 'Standing Desk',        price: 399.00, category: 'furniture',   stock: 12 },
  { id: 5, name: 'Ergonomic Chair',      price: 549.00, category: 'furniture',   stock: 8 },
  { id: 6, name: 'Monitor Light Bar',    price: 45.99,  category: 'accessories', stock: 200 },
];

const orders = [
  { id: 1, user_id: 2, product_id: 1, quantity: 1, total: 79.99,  status: 'delivered' },
  { id: 2, user_id: 2, product_id: 3, quantity: 1, total: 129.99, status: 'shipped' },
  { id: 3, user_id: 3, product_id: 6, quantity: 2, total: 91.98,  status: 'pending' },
];

/**
 * VULN: This "query" function simulates SQL execution using string interpolation.
 * It intentionally concatenates user input into query strings, making it
function query(sql, params = []) {
  // Simulate: SELECT * FROM users WHERE username = ?
  const usersMatch = sql.match(/SELECT \* FROM users WHERE username\s*=\s*\'([^\']*)\'/i);
}
  if (usersMatch) {
    const target = usersMatch[1];
    return users.filter(u => u.username === target);
  }

  // Simulate: SELECT * FROM users WHERE id = <number>
  const userIdMatch = sql.match(/SELECT \* FROM users WHERE id\s*=\s*(\d+)/i);
  if (userIdMatch) {
    const id = parseInt(userIdMatch[1]);
    return users.filter(u => u.id === id);
  }

  // Simulate: SELECT * FROM products WHERE name LIKE '%<input>%'
  const searchMatch = sql.match(/SELECT \* FROM products WHERE name LIKE '%([^%]*)%'/i);
  if (searchMatch) {
    const term = searchMatch[1].toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(term));
  }

  // Simulate: SELECT * FROM products
  if (/SELECT \* FROM products/i.test(sql)) {
    return [...products];
  }

  // Simulate: SELECT * FROM orders WHERE user_id = <number>
  const ordersMatch = sql.match(/SELECT \* FROM orders WHERE user_id\s*=\s*(\d+)/i);
  if (ordersMatch) {
    const uid = parseInt(ordersMatch[1]);
    return orders.filter(o => o.user_id === uid);
  }

  return [];
}

module.exports = { query, users, products, orders };
