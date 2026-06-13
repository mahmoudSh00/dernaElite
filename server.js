const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Initialize database
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL,
      discount INTEGER DEFAULT 0,
      description TEXT,
      image TEXT,
      rating REAL DEFAULT 4.5,
      reviews INTEGER DEFAULT 10,
      isNew INTEGER DEFAULT 0,
      isBestSeller INTEGER DEFAULT 0,
      isSale INTEGER DEFAULT 0,
      colors TEXT,
      sizes TEXT
    )`);

    // Cart table (persistent cart)
    db.run(`CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (productId) REFERENCES products(id)
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT,
      address TEXT,
      notes TEXT,
      total REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Order items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    )`);

    // Users table for admin users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`);

    // Check if users table is empty and add default admin
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (err) {
        console.error('Error checking users count:', err);
      } else if (row.count === 0) {
        const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        stmt.run('admin', 'admin123');
        stmt.finalize();
        console.log('Default admin user created: admin/admin123');
      }
    });

    // Check if products table is empty and seed initial data
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
      if (err) {
        console.error('Error checking products count:', err);
      } else if (row.count === 0) {
        seedInitialProducts();
      }
    });
  });
}

// Seed initial products from data/products.json if available
function seedInitialProducts() {
  const productsJsonPath = path.join(__dirname, 'data', 'products.json');
  if (fs.existsSync(productsJsonPath)) {
    const data = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
    if (data.products && data.products.length > 0) {
      const insertStmt = db.prepare(`INSERT INTO products 
        (id, name, category, price, discount, description, image, rating, reviews, isNew, isBestSeller, isSale, colors, sizes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      data.products.forEach(product => {
        insertStmt.run(
          product.id,
          product.name,
          product.category,
          product.price,
          product.discount,
          product.description,
          product.image,
          product.rating,
          product.reviews,
          product.isNew ? 1 : 0,
          product.isBestSeller ? 1 : 0,
          product.isSale ? 1 : 0,
          JSON.stringify(product.colors),
          JSON.stringify(product.sizes)
        );
      });
      
      insertStmt.finalize();
      console.log('Seeded initial products from products.json');
    }
  }
}

// Helper to format product
function formatProduct(row) {
  return {
    ...row,
    isNew: !!row.isNew,
    isBestSeller: !!row.isBestSeller,
    isSale: !!row.isSale,
    colors: row.colors ? JSON.parse(row.colors) : [],
    sizes: row.sizes ? JSON.parse(row.sizes) : []
  };
}

// ------------------ API Routes ------------------

// Products API
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ products: rows.map(formatProduct) });
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(formatProduct(row));
  });
});

app.post('/api/products', (req, res) => {
  const { name, category, price, discount, description, image, rating, reviews, isNew, isBestSeller, isSale, colors, sizes } = req.body;
  const stmt = db.prepare(`INSERT INTO products 
    (name, category, price, discount, description, image, rating, reviews, isNew, isBestSeller, isSale, colors, sizes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  stmt.run(
    name,
    category,
    price,
    discount || 0,
    description,
    image,
    rating || 4.5,
    reviews || 10,
    isNew ? 1 : 0,
    isBestSeller ? 1 : 0,
    isSale ? 1 : 0,
    JSON.stringify(colors || []),
    JSON.stringify(sizes || [])
  );
  
  stmt.finalize((err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product added successfully' });
  });
});

app.put('/api/products/:id', (req, res) => {
  const { name, category, price, discount, description, image, rating, reviews, isNew, isBestSeller, isSale, colors, sizes } = req.body;
  const stmt = db.prepare(`UPDATE products SET 
    name = ?, category = ?, price = ?, discount = ?, description = ?, image = ?, 
    rating = ?, reviews = ?, isNew = ?, isBestSeller = ?, isSale = ?, colors = ?, sizes = ?
    WHERE id = ?`);
  
  stmt.run(
    name,
    category,
    price,
    discount || 0,
    description,
    image,
    rating || 4.5,
    reviews || 10,
    isNew ? 1 : 0,
    isBestSeller ? 1 : 0,
    isSale ? 1 : 0,
    JSON.stringify(colors || []),
    JSON.stringify(sizes || []),
    req.params.id
  );
  
  stmt.finalize((err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product updated successfully' });
  });
});

app.delete('/api/products/:id', (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Cart API
app.get('/api/cart', (req, res) => {
  db.all(`SELECT cart.*, products.name, products.price, products.discount, products.image, products.category 
          FROM cart 
          JOIN products ON cart.productId = products.id`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ cart: rows });
  });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  db.get("SELECT * FROM cart WHERE productId = ?", [productId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      // Update quantity
      db.run("UPDATE cart SET quantity = quantity + ? WHERE productId = ?", [quantity || 1, productId], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Cart updated successfully' });
      });
    } else {
      // Add new item
      db.run("INSERT INTO cart (productId, quantity) VALUES (?, ?)", [productId, quantity || 1], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Item added to cart successfully' });
      });
    }
  });
});

app.put('/api/cart/:productId', (req, res) => {
  const { quantity } = req.body;
  db.run("UPDATE cart SET quantity = ? WHERE productId = ?", [quantity, req.params.productId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Cart updated successfully' });
  });
});

app.delete('/api/cart/:productId', (req, res) => {
  db.run("DELETE FROM cart WHERE productId = ?", [req.params.productId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Item removed from cart' });
  });
});

app.delete('/api/cart', (req, res) => {
  db.run("DELETE FROM cart", (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Cart cleared' });
  });
});

// Orders API
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders ORDER BY createdAt DESC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ orders: rows });
    });
});

app.post('/api/orders', (req, res) => {
    const { customerName, phone, city, address, notes, total, items } = req.body;
    
    db.serialize(() => {
        const stmt = db.prepare("INSERT INTO orders (customerName, phone, city, address, notes, total) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run(customerName, phone, city, address, notes, total, function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            const orderId = this.lastID;
            
            // Insert order items
            const itemStmt = db.prepare("INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)");
            items.forEach(item => {
                itemStmt.run(orderId, item.id, item.quantity, item.price * (1 - (item.discount || 0) / 100));
            });
            itemStmt.finalize();
            
            // Clear cart
            db.run("DELETE FROM cart");
            
            res.json({ message: 'Order submitted successfully', orderId });
        });
        stmt.finalize();
    });
});

// Users API for admin
app.get('/api/users', (req, res) => {
    db.all("SELECT id, username FROM users", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ users: rows });
    });
});

app.post('/api/users', (req, res) => {
    const { username, password } = req.body;
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(username, password, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'User added successfully', userId: this.lastID });
    });
    stmt.finalize();
});

app.put('/api/users/:id', (req, res) => {
    const { password } = req.body;
    const stmt = db.prepare("UPDATE users SET password = ? WHERE id = ?");
    stmt.run(password, req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Password updated successfully' });
    });
    stmt.finalize();
});

app.delete('/api/users/:id', (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// Auth API
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (user) {
            res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
