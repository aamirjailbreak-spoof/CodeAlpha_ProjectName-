const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
