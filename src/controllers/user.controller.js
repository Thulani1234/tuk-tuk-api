import bcrypt from 'bcryptjs';
import { getPool } from '../config/db.js';

export const createUser = async (req, res) => {
  try {
    const { username, password, role, station_id } = req.body;
    if (!username || !password || !role)
      return res.status(400).json({ error: 'username, password, role are required' });

    const hash = await bcrypt.hash(password, 12);
    const pool = await getPool();
    const result = await pool.query(
      `
        INSERT INTO users (username, password_hash, role, station_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [username, hash, role, station_id || null]
    );

    res.status(201).json({ id: result.rows[0].id, message: 'User created' });
  } catch (err) {
    if (err.code === '23505') // Postgres unique violation error code
      return res.status(409).json({ error: 'Username already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const listUsers = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query('SELECT id, username, role, station_id, created_at FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query('DELETE FROM users WHERE id = $1', [Number(req.params.id)]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};