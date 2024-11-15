const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cafe', // Change this to your database name
});

// Connect to Database
db.connect((err) => {
    if (err) throw new Error(`Database connection failed: ${err.stack}`);
    console.log('Connected to MySQL database.');
});

// Low stock threshold
const LOW_STOCK_THRESHOLD = 5; // Adjust this value as needed

// Function to notify when stock is low
const notifyLowStock = (product) => {
    console.log(`Notification: Stock for product "${product.name}" is low. Current Stock: ${product.stock}`);
};

// Employee Routes
// Registration Endpoint
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    try {
        const checkUserSql = 'SELECT * FROM employee WHERE email = ?';
        db.query(checkUserSql, [email], (err, results) => {
            if (err) return res.status(500).json({ message: 'Error checking user.' });
            if (results.length > 0) return res.status(409).json({ message: 'Email already in use.' });

            bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
                if (hashErr) return res.status(500).json({ message: 'Error hashing password.' });
                const sql = 'INSERT INTO employee (name, email, password) VALUES (?, ?, ?)';
                db.query(sql, [name, email, hashedPassword], (insertErr, results) => {
                    if (insertErr) return res.status(500).json({ message: 'Error inserting user.' });
                    res.status(201).json({ id: results.insertId, name, email });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Unexpected error during registration.' });
    }
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    const sql = 'SELECT * FROM employee WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching user.' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password.' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

        res.json({ success: true, employee: { id: user.id, name: user.name, email: user.email } });
    });
});

// Get All Employees
app.get('/api/employees', (req, res) => {
    const sql = 'SELECT * FROM employee';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching employees.' });
        res.json(results);
    });
});

// Add New Employee
app.post('/api/employees', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) return res.status(500).json({ message: 'Error hashing password.' });

        const sql = 'INSERT INTO employee (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, hashedPassword], (insertErr, results) => {
            if (insertErr) return res.status(500).json({ message: 'Error inserting employee.' });
            res.status(201).json({ id: results.insertId, name, email });
        });
    });
});

// Update Employee
app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const values = [name, email, id];

    if (password) {
        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) return res.status(500).json({ message: 'Error hashing password.' });

            const sql = 'UPDATE employee SET name = ?, email = ?, password = ? WHERE id = ?';
            db.query(sql, [name, email, hashedPassword, id], (updateErr) => {
                if (updateErr) return res.status(500).json({ message: 'Error updating employee.' });
                res.json({ id, name, email });
            });
        });
    } else {
        const sql = 'UPDATE employee SET name = ?, email = ? WHERE id = ?';
        db.query(sql, values, (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Error updating employee.' });
            res.json({ id, name, email });
        });
    }
});

// Delete Employee
app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM employee WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting employee.' });
        res.status(204).send();
    });
});

// Product Routes
// Get All Products
app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching products.' });
        res.json(results);
    });
});

// Add New Product
app.post('/api/products', (req, res) => {
    const { name, description, category, price, stock } = req.body;
    const sql = 'INSERT INTO products (name, description, category, price, stock) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, description, category, price, stock], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error adding product.' });
        res.status(201).json({ id: results.insertId, name, description, category, price, stock });
    });
});

// Update Product
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, category, price, stock } = req.body;
    const sql = 'UPDATE products SET name = ?, description = ?, category = ?, price = ?, stock = ? WHERE id = ?';
    db.query(sql, [name, description, category, price, stock, id], (err) => {
        if (err) return res.status(500).json({ message: 'Error updating product.' });
        res.json({ id, name, description, category, price, stock });
    });
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM products WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting product.' });
        res.status(204).send();
    });
});

// Sell Product
app.put('/api/products/sell/:id', (req, res) => {
    const { id } = req.params;
    const { sellQuantity } = req.body;

    if (!sellQuantity || sellQuantity <= 0) {
        return res.status(400).json({ message: 'Invalid quantity to sell.' });
    }

    const fetchStockQuery = 'SELECT stock, name FROM products WHERE id = ?'; // Includes product name for notification
    db.query(fetchStockQuery, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ message: 'Error fetching product.' });
        }

        const product = results[0];
        const currentStock = product.stock;

        if (currentStock < sellQuantity) {
            return res.status(400).json({ message: 'Not enough stock available.' });
        }

        const newStock = currentStock - sellQuantity;
        const updateStockQuery = 'UPDATE products SET stock = ? WHERE id = ?';

        db.query(updateStockQuery, [newStock, id], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ message: 'Error updating product stock.' });
            }

            // Notify for low stock
            if (newStock < LOW_STOCK_THRESHOLD) {
                notifyLowStock({ ...product, stock: newStock }); // Send the notification
            }
            res.json({ message: 'Product sold successfully.', newStock });
        });
    });

    // Get All Sales
app.get('/api/sales', (req, res) => {
    const sql = `
    SELECT s.id, p.name AS productName, e.name AS employeeName, s.quantity_sold, s.sale_date
    FROM sales s
    JOIN products p ON s.product_id = p.id
    JOIN employee e ON s.employee_id = e.id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching sales.' });
        res.json(results);
    });
});

// Sell Product and Log Sale
app.put('/api/products/sell/:id', (req, res) => {
    const { id } = req.params;
    const { sellQuantity, employeeId } = req.body; // Include employeeId in the request

    if (!sellQuantity || sellQuantity <= 0) {
        return res.status(400).json({ message: 'Invalid quantity to sell.' });
    }

    const fetchStockQuery = 'SELECT stock, name FROM products WHERE id = ?';
    db.query(fetchStockQuery, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ message: 'Error fetching product.' });
        }

        const product = results[0];
        const currentStock = product.stock;

        if (currentStock < sellQuantity) {
            return res.status(400).json({ message: 'Not enough stock available.' });
        }

        const newStock = currentStock - sellQuantity;
        const updateStockQuery = 'UPDATE products SET stock = ? WHERE id = ?';

        db.query(updateStockQuery, [newStock, id], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ message: 'Error updating product stock.' });
            }

            // Log the sale
            const logSaleQuery = 'INSERT INTO sales (product_id, employee_id, quantity_sold, sale_date) VALUES (?, ?, ?, NOW())';
            db.query(logSaleQuery, [id, employeeId, sellQuantity], (logErr) => {
                if (logErr) {
                    return res.status(500).json({ message: 'Error logging sale.' });
                }
                res.json({ message: 'Product sold and logged successfully.', newStock });
            });
        });
    });
});
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});