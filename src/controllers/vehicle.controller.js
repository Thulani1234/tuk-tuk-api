import { getPool, sql } from '../config/db.js';

export const getAllVehicles = async (req, res) => {
  try {
    const { district_id, province_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const pool   = await getPool();
    
    const params = [];
    let where = '1=1';
    let paramIndex = 1;

    if (district_id) {
      params.push(Number(district_id));
      where += ` AND v.district_id = $${paramIndex++}`;
    }
    if (province_id) {
      params.push(Number(province_id));
      where += ` AND d.province_id = $${paramIndex++}`;
    }
    if (status) {
      params.push(status);
      where += ` AND v.status = $${paramIndex++}`;
    }

    params.push(Number(limit));
    const limitIndex = paramIndex++;
    
    params.push(Number(offset));
    const offsetIndex = paramIndex++;

    const result = await pool.query(`
      SELECT
        v.id, v.registration_number, v.driver_name, v.driver_nic,
        v.contact_number, v.status, v.device_id, v.registered_at,
        d.name AS district_name, p.name AS province_name
      FROM vehicles v
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN provinces  p ON d.province_id = p.id
      WHERE ${where}
      ORDER BY v.id
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `, params);

    res.json({ data: result.rows, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.query(`
        SELECT
          v.*, d.name AS district_name, p.name AS province_name
        FROM vehicles v
        LEFT JOIN districts d ON v.district_id = d.id
        LEFT JOIN provinces  p ON d.province_id = p.id
        WHERE v.id = $1
      `, [Number(req.params.id)]);

    if (!result.rows[0])
      return res.status(404).json({ error: 'Vehicle not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const {
      registration_number, driver_name, driver_nic,
      contact_number, district_id, device_id,
    } = req.body;

    if (!registration_number)
      return res.status(400).json({ error: 'registration_number is required' });

    const pool   = await getPool();
    const result = await pool.query(`
        INSERT INTO vehicles
          (registration_number, driver_name, driver_nic,
           contact_number, district_id, device_id)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        registration_number,
        driver_name || null,
        driver_nic || null,
        contact_number || null,
        district_id || null,
        device_id || null
      ]);

    res.status(201).json({ id: result.rows[0].id, message: 'Vehicle registered' });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Registration number already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const {
      driver_name, driver_nic, contact_number,
      district_id, status, device_id,
    } = req.body;

    const pool = await getPool();
    const result = await pool.query(`
        UPDATE vehicles SET
          driver_name    = $1,
          driver_nic     = $2,
          contact_number = $3,
          district_id    = $4,
          status         = $5,
          device_id      = $6
        WHERE id = $7
      `, [
        driver_name || null,
        driver_nic || null,
        contact_number || null,
        district_id || null,
        status || null,
        device_id || null,
        Number(req.params.id)
      ]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Vehicle not found' });

    res.json({ message: 'Vehicle updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1', [Number(req.params.id)]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Vehicle not found' });

    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};