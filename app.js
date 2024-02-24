// Import required modules
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Create Express application
const app = express();
const port = 3000;

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hrishiM$943',
    database: 'Vehicle_tracking_system'
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create (Insert) operation
app.post('/Bookings', (req, res) => {
    const { username, password } = req.body;
    const sql = `INSERT INTO User (Username, Password) VALUES (?, ?)`;
    db.query(sql, [username, password], (err, result) => {
        if (err) throw err;
        res.send('User created successfully');
    });
});

// Read (Select) operation
app.get('/users', (req, res) => {
    const sql = `SELECT * FROM User`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

// Update operation
app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const { password } = req.body;
    const sql = `UPDATE User SET Password = ? WHERE UserID = ?`;
    db.query(sql, [password, id], (err, result) => {
        if (err) throw err;
        res.send('User updated successfully');
    });
});

// Delete operation
app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM User WHERE UserID = ?`;
    db.query(sql, id, (err, result) => {
        if (err) throw err;
        res.send('User deleted successfully');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
