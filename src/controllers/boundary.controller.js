
import { getPool, sql } from '../config/db.js';

export const getProvinces = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .query('SELECT * FROM provinces ORDER BY name');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const { province_id } = req.query;
    const pool  = await getPool();
    const req2  = pool.request();
    let   where = '';

    if (province_id) {
      req2.input('province_id', sql.Int, Number(province_id));
      where = 'WHERE d.province_id = @province_id';
    }

    const result = await req2.query(`
      SELECT d.*, p.name AS province_name
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
      ${where}
      ORDER BY d.name
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStations = async (req, res) => {
  try {
    const { district_id } = req.query;
    const pool  = await getPool();
    const req2  = pool.request();
    let   where = '';

    if (district_id) {
      req2.input('district_id', sql.Int, Number(district_id));
      where = 'WHERE s.district_id = @district_id';
    }

    const result = await req2.query(`
      SELECT s.*, d.name AS district_name, p.name AS province_name
      FROM police_stations s
      JOIN districts d ON s.district_id  = d.id
      JOIN provinces  p ON d.province_id = p.id
      ${where}
      ORDER BY s.name
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};