
import { getPool, sql } from '../config/db.js';

export const addPing = async (req, res) => {
  try {
    const { vehicle_id, latitude, longitude, speed, heading } = req.body;
    if (!vehicle_id || latitude == null || longitude == null)
      return res.status(400).json({ error: 'vehicle_id, latitude, longitude are required' });

    const pool = await getPool();
    await pool.request()
      .input('vehicle_id', sql.Int,           Number(vehicle_id))
      .input('latitude',   sql.Decimal(10,8), latitude)
      .input('longitude',  sql.Decimal(11,8), longitude)
      .input('speed',      sql.Decimal(5,2),  speed   ?? null)
      .input('heading',    sql.Decimal(5,2),  heading ?? null)
      .query(`
        INSERT INTO location_pings
          (vehicle_id, latitude, longitude, speed, heading)
        VALUES
          (@vehicle_id, @latitude, @longitude, @speed, @heading)
      `);

    res.status(201).json({ message: 'Ping recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getLastKnown = async (req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('vehicleId', sql.Int, Number(req.params.vehicleId))
      .query(`
        SELECT
          v.id, v.registration_number, v.driver_name, v.status,
          lp.latitude, lp.longitude, lp.speed, lp.heading, lp.pinged_at,
          d.name AS district_name, p.name AS province_name
        FROM vehicles v
        LEFT JOIN districts d ON v.district_id = d.id
        LEFT JOIN provinces  p ON d.province_id = p.id
        OUTER APPLY (
          SELECT TOP 1
            latitude, longitude, speed, heading, pinged_at
          FROM location_pings
          WHERE vehicle_id = v.id
          ORDER BY pinged_at DESC
        ) lp
        WHERE v.id = @vehicleId
      `);

    if (!result.recordset[0])
      return res.status(404).json({ error: 'Vehicle not found' });

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getLiveAll = async (req, res) => {
  try {
    const { district_id, province_id } = req.query;
    const pool = await getPool();
    const req2 = pool.request();

    let where = "v.status = 'active'";
    if (district_id) {
      req2.input('district_id', sql.Int, Number(district_id));
      where += ' AND v.district_id = @district_id';
    }
    if (province_id) {
      req2.input('province_id', sql.Int, Number(province_id));
      where += ' AND d.province_id = @province_id';
    }

    const result = await req2.query(`
      SELECT
        v.id, v.registration_number, v.driver_name, v.status,
        lp.latitude, lp.longitude, lp.speed, lp.pinged_at,
        d.name AS district_name, p.name AS province_name
      FROM vehicles v
      LEFT JOIN districts d ON v.district_id = d.id
      LEFT JOIN provinces  p ON d.province_id = p.id
      OUTER APPLY (
        SELECT TOP 1
          latitude, longitude, speed, pinged_at
        FROM location_pings
        WHERE vehicle_id = v.id
        ORDER BY pinged_at DESC
      ) lp
      WHERE ${where}
      ORDER BY v.id
    `);

    res.json({ count: result.recordset.length, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { from, to, district_id, province_id, page = 1, limit = 200 } = req.query;
    const offset = (page - 1) * limit;
    const pool   = await getPool();
    const req2   = pool.request()
      .input('limit',  sql.Int, Number(limit))
      .input('offset', sql.Int, Number(offset));

    let where = '1=1';
    if (req.params.vehicleId) {
      req2.input('vehicleId', sql.Int, Number(req.params.vehicleId));
      where += ' AND lp.vehicle_id = @vehicleId';
    }
    if (from) {
      req2.input('from', sql.DateTime2, new Date(from));
      where += ' AND lp.pinged_at >= @from';
    }
    if (to) {
      req2.input('to', sql.DateTime2, new Date(to));
      where += ' AND lp.pinged_at <= @to';
    }
    if (district_id) {
      req2.input('district_id', sql.Int, Number(district_id));
      where += ' AND v.district_id = @district_id';
    }
    if (province_id) {
      req2.input('province_id', sql.Int, Number(province_id));
      where += ' AND d.province_id = @province_id';
    }

    const result = await req2.query(`
      SELECT
        lp.id, lp.latitude, lp.longitude,
        lp.speed, lp.heading, lp.pinged_at,
        v.registration_number, v.driver_name,
        d.name AS district_name, p.name AS province_name
      FROM location_pings lp
      JOIN     vehicles  v ON lp.vehicle_id  = v.id
      LEFT JOIN districts d ON v.district_id  = d.id
      LEFT JOIN provinces  p ON d.province_id = p.id
      WHERE ${where}
      ORDER BY lp.pinged_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    res.json({ data: result.recordset, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};