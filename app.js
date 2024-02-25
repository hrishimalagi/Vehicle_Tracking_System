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
    password: 'hrishiM$943', // Update with your MySQL password
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

// Create Booking operation
app.post('/api/Bookings', (req, res) => {
    const { BookingID, VehicleID, UserID, DriverID,BookingTime} = req.body;
    const sql = `INSERT INTO Booking (BookingID, VehicleID, UserID, DriverID,BookingTime) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [BookingID, VehicleID, UserID, DriverID,BookingTime], (err, result) => {
        if (err) {
            console.error('Error creating booking:', err);
            res.status(500).send('Error creating booking');
        } else {
            res.status(200).send('Booking created successfully');
        }
    });
});

// Fetch Bookings operation GET request handler for fetching bookings
app.get('/api/FetchBookings', (req, res) => {
    const { BookingTime } = req.query;
    const sql = `SELECT * FROM Booking WHERE BookingTime = ?`;
    db.query(sql, [BookingTime], (err, results) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            res.status(500).send('Error fetching bookings');
        } else {
            res.status(200).json(results);
        }
    });
});


// Update Booking operation
app.put('/api/Updatebookings/:id', (req, res) => {
    const bookingId = req.params.id;
    const { userID, vehicleID, driverID, bookingTime } = req.body;
    const sql = `UPDATE Booking SET UserID=?, VehicleID=?, DriverID=?, BookingTime=? WHERE BookingID=?`;
    db.query(sql, [userID, vehicleID, driverID, bookingTime, bookingId], (err, result) => {
        if (err) {
            console.error('Error updating booking:', err);
            res.status(500).send('Error updating booking');
        } else {
            res.status(200).send('Booking updated successfully');
        }
    });
});

// Delete Booking operation
app.delete('/api/DeleteBookings/:id', (req, res) => {
    const bookingId = req.params.id;
    const sql = `DELETE FROM Booking WHERE BookingID = ?`;
    db.query(sql, [bookingId], (err, result) => {
        if (err) {
            console.error('Error deleting booking:', err);
            res.status(500).send('Error deleting booking');
        } else {
            if (result.affectedRows > 0) {
                res.status(200).send('Booking deleted successfully');
            } else {
                res.status(404).send('Booking not found');
            }
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
