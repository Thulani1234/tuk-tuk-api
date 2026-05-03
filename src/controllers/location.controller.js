import { getPool } from '../config/db.js';

export const addPing = async (req, res) => {
  try {
    const { vehicle_id, latitude, longitude, speed, heading } = req.body;
    if (!vehicle_id || latitude == null || longitude == null)
      return res.status(400).json({ error: 'vehicle_id, latitude, longitude are required' });

    const pool = await getPool();
    await pool.query(
      `
        INSERT INTO location_pings
          (vehicle_id, latitude, longitude, speed, heading)
        VALUES
          ($1, $2, $3, $4, $5)
      `,
      [Number(vehicle_id), latitude, longitude, speed ?? null, heading ?? null]
    );

    res.status(201).json({ message: 'Ping recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getLastKnown = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query(
      `
        SELECT
          v.id, v.registration_number, v.driver_name, v.status,
          lp.latitude, lp.longitude, lp.speed, lp.heading, lp.pinged_at,
          d.name AS district_name, p.name AS province_name
        FROM vehicles v
        LEFT JOIN districts d ON v.district_id = d.id
        LEFT JOIN provinces  p ON d.province_id = p.id
        LEFT JOIN LATERAL (
          SELECT
            latitude, longitude, speed, heading, pinged_at
          FROM location_pings
          WHERE vehicle_id = v.id
          ORDER BY pinged_at DESC
          LIMIT 1
        ) lp ON true
        WHERE v.id = $1
      `,
      [Number(req.params.vehicleId)]
    );

    if (!result.rows[0])
      return res.status(404).json({ error: 'Vehicle not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getLiveAll = async (req, res) => {
  try {
    const { district_id, province_id } = req.query;
    const pool = await getPool();

    let where = "v.status = 'active'";
    const params = [];
    let paramIndex = 1;

    if (district_id) {
      params.push(Number(district_id));
      where += ` AND v.district_id = $${paramIndex++}`;
    }
    if (province_id) {
      params.push(Number(province_id));
      where += ` AND d.province_id = $${paramIndex++}`;
    }

    const result = await pool.query(
      `
        SELECT
          v.id, v.registration_number, v.driver_name, v.status,
          lp.latitude, lp.longitude, lp.speed, lp.pinged_at,
          d.name AS district_name, p.name AS province_name
        FROM vehicles v
        LEFT JOIN districts d ON v.district_id = d.id
        LEFT JOIN provinces  p ON d.province_id = p.id
        LEFT JOIN LATERAL (
          SELECT
            latitude, longitude, speed, pinged_at
          FROM location_pings
          WHERE vehicle_id = v.id
          ORDER BY pinged_at DESC
          LIMIT 1
        ) lp ON true
        WHERE ${where}
        ORDER BY v.id
      `,
      params
    );

    res.json({ count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { from, to, district_id, province_id, page = 1, limit = 200 } = req.query;
    const offset = (page - 1) * limit;
    const pool = await getPool();

    let where = '1=1';
    const params = [];
    let paramIndex = 1;

    if (req.params.vehicleId) {
      params.push(Number(req.params.vehicleId));
      where += ` AND lp.vehicle_id = $${paramIndex++}`;
    }
    if (from) {
      params.push(new Date(from));
      where += ` AND lp.pinged_at >= $${paramIndex++}`;
    }
    if (to) {
      params.push(new Date(to));
      where += ` AND lp.pinged_at <= $${paramIndex++}`;
    }
    if (district_id) {
      params.push(Number(district_id));
      where += ` AND v.district_id = $${paramIndex++}`;
    }
    if (province_id) {
      params.push(Number(province_id));
      where += ` AND d.province_id = $${paramIndex++}`;
    }

    params.push(Number(limit));
    const limitIndex = paramIndex++;
    
    params.push(Number(offset));
    const offsetIndex = paramIndex++;

    const result = await pool.query(
      `
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
        LIMIT $${limitIndex} OFFSET $${offsetIndex}
      `,
      params
    );

    res.json({ data: result.rows, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};