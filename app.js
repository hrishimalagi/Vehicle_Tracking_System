// Import required modules
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors middleware
const bcrypt = require('bcrypt');

// Create Express application
const app = express();
const port = 3000;

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Update with your MySQL password
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

// Use cors middleware to enable CORS
app.use(cors());

// Create Booking operation
app.post('/api/CreateBookings', (req, res) => {
    const { vehicleID, userID, driverID, bookingTime } = req.body;

    // Check if the vehicle and driver are available
    const availabilityCheckSql = `SELECT * FROM Booking WHERE VehicleID = ? AND DriverID = ? AND BookingTime = ?`;
    db.query(availabilityCheckSql, [vehicleID, driverID, bookingTime], (err, results) => {
        if (err) {
            console.error('Error checking availability:', err);
            res.status(500).send('Error creating booking');
        } else {
            if (results.length > 0) {
                res.status(400).send('Vehicle or driver is already booked for the given time slot');
            } else {
                // Vehicle and driver are available, proceed with creating the booking
                const createBookingSql = `INSERT INTO Booking (VehicleID, UserID, DriverID, BookingTime) VALUES (?, ?, ?, ?)`;
                db.query(createBookingSql, [vehicleID, userID, driverID, bookingTime], (err, result) => {
                    if (err) {
                        console.error('Error creating booking:', err);
                        res.status(500).send('Error creating booking');
                    } else {
                        // Retrieve the booking ID of the newly inserted booking
                        const newBookingID = result.insertId;

                        // Construct response object with booking details including the booking ID
                        const bookingDetails = {
                            bookingID: newBookingID,
                            vehicleID: vehicleID,
                            userID: userID,
                            driverID: driverID,
                            bookingTime: bookingTime
                        };

                        // Return the booking details to the frontend
                        res.status(200).json(bookingDetails);
                    }
                });
            }
        }
    });
});


// Fetch Bookings operation GET request handler for fetching bookings
app.get('/api/FetchBookings', (req, res) => {
    const { bookingTime, userID } = req.query;

    // Check if both bookingTime and userID are provided
    if (bookingTime && userID) {
        // Construct the SQL query with placeholders for parameters
        const sql = `
            SELECT Booking.*, User.Username 
            FROM Booking 
            INNER JOIN User ON Booking.UserID = User.UserID 
            WHERE Booking.BookingTime = ? AND Booking.UserID = ?`;

        // Execute the query with the provided parameters
        db.query(sql, [bookingTime, userID], (err, results) => {
            if (err) {
                console.error('Error fetching bookings:', err);
                res.status(500).send('Error fetching bookings');
            } else {
                // Check if any bookings were found
                if (results.length > 0) {
                    res.status(200).json(results);
                } else {
                    res.status(404).send('No bookings found for the provided criteria');
                }
            }
        });
    } else {
        // Handle the case where one or both parameters are missing
        res.status(400).send('Both bookingTime and userID are required');
    }
});



// Update Booking operation
app.put('/api/UpdateBookings/:id', (req, res) => {
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

// Fetch All Bookings operation
app.get('/api/FetchAllBookings', (req, res) => {
    // Construct the SQL query to fetch all bookings
    const sql = `
        SELECT Booking.*, User.Username 
        FROM Booking 
        INNER JOIN User ON Booking.UserID = User.UserID`;

    // Execute the query
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching all bookings:', err);
            res.status(500).send('Error fetching all bookings');
        } else {
            res.status(200).json(results);
        }
    });
});

//check if logged in

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    //salt password
    const sal=bcrypt.genSalt(10);
    // Hash the password
    bcrypt.hash(password+sal, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            console.error('Error hashing password:', hashErr);
            return res.status(500).send('Error registering user');
        }

        // SQL query to insert user into the database
        const sql = 'INSERT INTO user_cred (Username, Password) VALUES (?, ?)';
        db.query(sql, [username, hashedPassword], (sqlErr, results) => {
            if (sqlErr) {
                console.error('Error registering user:', sqlErr);
                return res.status(500).send('Error registering user');
            }

            // User successfully registered
            res.status(201).send('User registered successfully');
        });
    });
});


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM user_cred WHERE udatsername = ?`;
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).send('Error logging in');
        }

        if (results.length > 0) {
            const user = results[0];
            // Compare hashed password
            bcrypt.compare(password, user.Password, (bcryptErr, bcryptRes) => {
                if (bcryptErr) {
                    console.error('Error comparing passwords:', bcryptErr);
                    return res.status(500).send('Error logging in');
                }
                if (bcryptRes) {
                    // Passwords match, user authenticated
                    res.status(200).json(user);
                } else {
                    // Passwords don't match
                    res.status(401).send('Invalid username or password');
                }
            });
        } else {
            // No user found with the provided username
            res.status(404).send('User not found');
        }
    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
