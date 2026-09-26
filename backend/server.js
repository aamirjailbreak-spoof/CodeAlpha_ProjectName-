const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    await db.query('SELECT NOW()');
    return res.json({
      success: true,
      message: 'PostgreSQL connection successful'
    });
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'PostgreSQL connection failed'
    });
  }
});

// Modular Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
