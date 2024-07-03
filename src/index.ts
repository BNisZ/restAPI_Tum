import express from 'express';
import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise'; import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

// Create
app.post('/users', async (req, res) => {
    try {
      const { name, email } = req.body;
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO user (name, email) VALUES (?, ?)', [name, email]);
      res.status(201).json({ id: result.insertId, name, email });
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  
  // Read (all users)
  app.get('/users', async (req, res) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM user');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error });
    }
  });
  
  // Read (single user)
  app.get('/users/:id', async (req, res) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM user WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user' });
    }
  });
  
  // Update
  app.put('/users/:id', async (req, res) => {
    try {
      const { name, email } = req.body;
      const [result] = await pool.query<ResultSetHeader>('UPDATE user SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id]);
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({ id: req.params.id, name, email });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating user' });
    }
  });
  
  // Delete
  app.delete('/users/:id', async (req, res) => {
    try {
      const [result] = await pool.query<ResultSetHeader>('DELETE FROM user WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({ message: 'User deleted successfully' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting user' });
    }
  });

app.listen(3000, () => console.log('Server running on port 3000'));