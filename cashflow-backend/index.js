const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/loans', require('./routes/loans'));

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI && MONGO_URI !== 'mongodb://localhost:27017/cashflow') {
	mongoose.connect(MONGO_URI)
		.then(() => console.log('Connected to MongoDB Atlas'))
		.catch((err) => console.error('MongoDB connection error:', err));
} else {
	console.warn('Please replace MONGO_URI in .env with your MongoDB Atlas connection string.');
}

app.get('/health', (req, res) => {
	res.status(200).json({ status: 'OK', message: 'CashFlow API is running.' });
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
