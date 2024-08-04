require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(fileUpload()); // Add fileUpload middleware here

// Test route
app.get('/', (request, response) => {
  response.status(200).json({ message: 'Hello World!' });
});

// Database connection
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;
db.once('open', () => console.log(`Connected to database successfully`));
db.on('error', (errorMessage) => console.log(errorMessage));

// Routes
const loginRoute = require('./routes/loginRoute');
app.use('/login', loginRoute);

const signupRoute = require('./routes/signupRoute');
app.use('/signup', signupRoute);

const uploadRoute = require('./routes/uploadRoute');
app.use('/upload', uploadRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
