// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const authRoutes = require('./routes/authRoute');
// const paymentRoutes = require('./routes/paymentRoute');

// const app = express();
// const PORT = process.env.PORT || 8080;

// app.use(express.json());
// const connectDB = require('./config/db');
// connectDB();

// app.use('/api', authRoutes);
// app.use('/api', paymentRoutes);

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
require('dotenv').config(); // Load environment variables
const express = require('express'); // Import Express
const cors = require('cors'); // Import CORS middleware
const mongoose = require('mongoose'); // Import Mongoose
const authRoutes = require('./routes/suthRoute'); // Import authentication routes
const paymentRoutes = require('./routes/paymentRoute'); // Import payment routes

const app = express(); // Initialize Express
const PORT = process.env.PORT || 8080; // Use environment PORT or default to 8080

// Import and use cors middleware to handle CORS errors
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests only from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow cookies or authorization headers
};
app.use(cors(corsOptions));

// Middleware to parse incoming JSON data
app.use(express.json());

// Import database connection
const connectDB = require('./config/db');
connectDB(); // Connect to the MongoDB database
app.get('/', (req, res) => {
  res.status(200).send('Server is running!');
});
// Mount routes
app.use('/api', authRoutes); // Use authentication routes
app.use('/api', paymentRoutes); // Use payment routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
