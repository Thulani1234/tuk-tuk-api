
import bcrypt from 'bcryptjs';
import { getPool, sql } from '../config/db.js';

export const createUser = async (req, res) => {
  try {
    const { username, password, role, station_id } = req.body;
    if (!username || !password || !role)
      return res.status(400).json({ error: 'username, password, role are required' });

    const hash   = await bcrypt.hash(password, 12);
    const pool   = await getPool();
    const result = await pool.request()
      .input('username',      sql.NVarChar, username)
      .input('password_hash', sql.NVarChar, hash)
      .input('role',          sql.NVarChar, role)
      .input('station_id',    sql.Int,      station_id || null)
      .query(`
        INSERT INTO users (username, password_hash, role, station_id)
        OUTPUT INSERTED.id
        VALUES (@username, @password_hash, @role, @station_id)
      `);

    res.status(201).json({ id: result.recordset[0].id, message: 'User created' });
  } catch (err) {
    if (err.number === 2627 || err.number === 2601)
      return res.status(409).json({ error: 'Username already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const listUsers = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .query('SELECT id, username, role, station_id, created_at FROM users ORDER BY id');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(req.params.id))
      .query('DELETE FROM users WHERE id = @id');

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};