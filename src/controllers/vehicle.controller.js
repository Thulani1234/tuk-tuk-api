
import { getPool, sql } from '../config/db.js';

export const getAllVehicles = async (req, res) => {
  try {
    const { district_id, province_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const pool   = await getPool();
    const req2   = pool.request()
      .input('limit',  sql.Int, Number(limit))
      .input('offset', sql.Int, Number(offset));

    let where = '1=1';
    if (district_id) {
      req2.input('district_id', sql.Int, Number(district_id));
      where += ' AND v.district_id = @district_id';
    }
    if (province_id) {
      req2.input('province_id', sql.Int, Number(province_id));
      where += ' AND d.province_id = @province_id';
    }
    if (status) {
      req2.input('status', sql.NVarChar, status);
      where += ' AND v.status = @status';
    }

    const result = await req2.query(`
      SELECT
        v.id, v.registration_number, v.driver_name, v.driver_nic,
        v.contact_number, v.status, v.device_id, v.registered_at,
        d.name AS district_name, p.name AS province_name
      FROM vehicles v
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN provinces  p ON d.province_id = p.id
      WHERE ${where}
      ORDER BY v.id
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    res.json({ data: result.recordset, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(req.params.id))
      .query(`
        SELECT
          v.*, d.name AS district_name, p.name AS province_name
        FROM vehicles v
        LEFT JOIN districts d ON v.district_id = d.id
        LEFT JOIN provinces  p ON d.province_id = p.id
        WHERE v.id = @id
      `);

    if (!result.recordset[0])
      return res.status(404).json({ error: 'Vehicle not found' });

    res.json(result.recordset[0]);
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
    const result = await pool.request()
      .input('registration_number', sql.NVarChar, registration_number)
      .input('driver_name',         sql.NVarChar, driver_name    || null)
      .input('driver_nic',          sql.NVarChar, driver_nic     || null)
      .input('contact_number',      sql.NVarChar, contact_number || null)
      .input('district_id',         sql.Int,      district_id    || null)
      .input('device_id',           sql.NVarChar, device_id      || null)
      .query(`
        INSERT INTO vehicles
          (registration_number, driver_name, driver_nic,
           contact_number, district_id, device_id)
        OUTPUT INSERTED.id
        VALUES
          (@registration_number, @driver_name, @driver_nic,
           @contact_number, @district_id, @device_id)
      `);

    res.status(201).json({ id: result.recordset[0].id, message: 'Vehicle registered' });
  } catch (err) {
    if (err.number === 2627 || err.number === 2601)
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
    const result = await pool.request()
      .input('id',             sql.Int,      Number(req.params.id))
      .input('driver_name',    sql.NVarChar, driver_name    || null)
      .input('driver_nic',     sql.NVarChar, driver_nic     || null)
      .input('contact_number', sql.NVarChar, contact_number || null)
      .input('district_id',    sql.Int,      district_id    || null)
      .input('status',         sql.NVarChar, status         || null)
      .input('device_id',      sql.NVarChar, device_id      || null)
      .query(`
        UPDATE vehicles SET
          driver_name    = @driver_name,
          driver_nic     = @driver_nic,
          contact_number = @contact_number,
          district_id    = @district_id,
          status         = @status,
          device_id      = @device_id
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0)
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
    const result = await pool.request()
      .input('id', sql.Int, Number(req.params.id))
      .query('DELETE FROM vehicles WHERE id = @id');

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ error: 'Vehicle not found' });

    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};