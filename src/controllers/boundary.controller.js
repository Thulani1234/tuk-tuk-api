import { getPool } from '../config/db.js';

export const getProvinces = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query('SELECT * FROM provinces ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const { province_id } = req.query;
    const pool = await getPool();
    
    let where = '';
    const params = [];

    if (province_id) {
      params.push(Number(province_id));
      where = 'WHERE d.province_id = $1';
    }

    const result = await pool.query(`
      SELECT d.*, p.name AS province_name
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
      ${where}
      ORDER BY d.name
    `, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStations = async (req, res) => {
  try {
    const { district_id } = req.query;
    const pool = await getPool();

    let where = '';
    const params = [];

    if (district_id) {
      params.push(Number(district_id));
      where = 'WHERE s.district_id = $1';
    }

    const result = await pool.query(`
      SELECT s.*, d.name AS district_name, p.name AS province_name
      FROM police_stations s
      JOIN districts d ON s.district_id  = d.id
      JOIN provinces  p ON d.province_id = p.id
      ${where}
      ORDER BY s.name
    `, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};