import sql    from 'mssql';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  server:         'localhost',
  port:           1433,
  user:           process.env.DB_USER,
  password:       process.env.DB_PASSWORD,
  database:       process.env.DB_NAME,
  requestTimeout: 120000,
  connectionTimeout: 30000,
  options: {
    encrypt:                false,
    trustServerCertificate: true,
    enableArithAbort:       true,
  },
};

const provinces = [
  { name: 'Western',       code: 'WP'  },
  { name: 'Central',       code: 'CP'  },
  { name: 'Southern',      code: 'SP'  },
  { name: 'Northern',      code: 'NP'  },
  { name: 'Eastern',       code: 'EP'  },
  { name: 'North Western', code: 'NWP' },
  { name: 'North Central', code: 'NCP' },
  { name: 'Uva',           code: 'UV'  },
  { name: 'Sabaragamuwa',  code: 'SGP' },
];

const districts = [
  { name: 'Colombo',      province: 'Western'       },
  { name: 'Gampaha',      province: 'Western'       },
  { name: 'Kalutara',     province: 'Western'       },
  { name: 'Kandy',        province: 'Central'       },
  { name: 'Matale',       province: 'Central'       },
  { name: 'Nuwara Eliya', province: 'Central'       },
  { name: 'Galle',        province: 'Southern'      },
  { name: 'Matara',       province: 'Southern'      },
  { name: 'Hambantota',   province: 'Southern'      },
  { name: 'Jaffna',       province: 'Northern'      },
  { name: 'Kilinochchi',  province: 'Northern'      },
  { name: 'Mannar',       province: 'Northern'      },
  { name: 'Vavuniya',     province: 'Northern'      },
  { name: 'Mullaitivu',   province: 'Northern'      },
  { name: 'Batticaloa',   province: 'Eastern'       },
  { name: 'Ampara',       province: 'Eastern'       },
  { name: 'Trincomalee',  province: 'Eastern'       },
  { name: 'Kurunegala',   province: 'North Western' },
  { name: 'Puttalam',     province: 'North Western' },
  { name: 'Anuradhapura', province: 'North Central' },
  { name: 'Polonnaruwa',  province: 'North Central' },
  { name: 'Badulla',      province: 'Uva'           },
  { name: 'Monaragala',   province: 'Uva'           },
  { name: 'Ratnapura',    province: 'Sabaragamuwa'  },
  { name: 'Kegalle',      province: 'Sabaragamuwa'  },
];

const stations = [
  { name: 'Colombo Central Police Station', district: 'Colombo'      },
  { name: 'Dehiwala Police Station',        district: 'Colombo'      },
  { name: 'Moratuwa Police Station',        district: 'Colombo'      },
  { name: 'Gampaha Police Station',         district: 'Gampaha'      },
  { name: 'Negombo Police Station',         district: 'Gampaha'      },
  { name: 'Kalutara Police Station',        district: 'Kalutara'     },
  { name: 'Kandy Central Police Station',   district: 'Kandy'        },
  { name: 'Peradeniya Police Station',      district: 'Kandy'        },
  { name: 'Matale Police Station',          district: 'Matale'       },
  { name: 'Nuwara Eliya Police Station',    district: 'Nuwara Eliya' },
  { name: 'Galle Fort Police Station',      district: 'Galle'        },
  { name: 'Matara Police Station',          district: 'Matara'       },
  { name: 'Hambantota Police Station',      district: 'Hambantota'   },
  { name: 'Jaffna Police Station',          district: 'Jaffna'       },
  { name: 'Vavuniya Police Station',        district: 'Vavuniya'     },
  { name: 'Batticaloa Police Station',      district: 'Batticaloa'   },
  { name: 'Trincomalee Police Station',     district: 'Trincomalee'  },
  { name: 'Ampara Police Station',          district: 'Ampara'       },
  { name: 'Kurunegala Police Station',      district: 'Kurunegala'   },
  { name: 'Anuradhapura Police Station',    district: 'Anuradhapura' },
  { name: 'Polonnaruwa Police Station',     district: 'Polonnaruwa'  },
  { name: 'Badulla Police Station',         district: 'Badulla'      },
  { name: 'Ratnapura Police Station',       district: 'Ratnapura'    },
  { name: 'Kegalle Police Station',         district: 'Kegalle'      },
  { name: 'Puttalam Police Station',        district: 'Puttalam'     },
];

const rand  = (min, max) => Math.random() * (max - min) + min;
const randI = (min, max) => Math.floor(rand(min, max));

async function seed() {
  const pool = await sql.connect(config);
  console.log('Connected to SQL Server\n');

  console.log('Clearing old data...');
  await pool.request().query(`DELETE FROM location_pings`);
  console.log('  location_pings cleared');
  await pool.request().query(`DELETE FROM vehicles`);
  console.log('  vehicles cleared');
  await pool.request().query(`DELETE FROM users`);
  console.log('  users cleared');
  await pool.request().query(`DELETE FROM police_stations`);
  console.log('  police_stations cleared');
  await pool.request().query(`DELETE FROM districts`);
  console.log('  districts cleared');
  await pool.request().query(`DELETE FROM provinces`);
  console.log('  provinces cleared');

  await pool.request().query(`DBCC CHECKIDENT('provinces',       RESEED, 0)`);
  await pool.request().query(`DBCC CHECKIDENT('districts',       RESEED, 0)`);
  await pool.request().query(`DBCC CHECKIDENT('police_stations', RESEED, 0)`);
  await pool.request().query(`DBCC CHECKIDENT('users',           RESEED, 0)`);
  await pool.request().query(`DBCC CHECKIDENT('vehicles',        RESEED, 0)`);
  await pool.request().query(`DBCC CHECKIDENT('location_pings',  RESEED, 0)`);

  console.log('Seeding provinces...');
  for (const p of provinces) {
    await pool.request()
      .input('name', sql.NVarChar, p.name)
      .input('code', sql.NVarChar, p.code)
      .query('INSERT INTO provinces (name, code) VALUES (@name, @code)');
  }

  const { recordset: provRows } = await pool.request()
    .query('SELECT id, name FROM provinces');
  const provMap = Object.fromEntries(provRows.map(r => [r.name, r.id]));

  console.log('Seeding districts...');
  for (const d of districts) {
    await pool.request()
      .input('name',        sql.NVarChar, d.name)
      .input('province_id', sql.Int,      provMap[d.province])
      .query('INSERT INTO districts (name, province_id) VALUES (@name, @province_id)');
  }

  const { recordset: distRows } = await pool.request()
    .query('SELECT id, name FROM districts');
  const distMap = Object.fromEntries(distRows.map(r => [r.name, r.id]));
  const distIds = distRows.map(r => r.id);

  console.log('Seeding police stations...');
  for (const s of stations) {
    await pool.request()
      .input('name',        sql.NVarChar, s.name)
      .input('district_id', sql.Int,      distMap[s.district])
      .input('address',     sql.NVarChar, `${s.name}, Sri Lanka`)
      .query(`
        INSERT INTO police_stations (name, district_id, address)
        VALUES (@name, @district_id, @address)
      `);
  }

  console.log('Seeding admin user...');
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  await pool.request()
    .input('username',      sql.NVarChar, 'admin')
    .input('password_hash', sql.NVarChar, adminHash)
    .input('role',          sql.NVarChar, 'hq_admin')
    .query(`
      INSERT INTO users (username, password_hash, role)
      VALUES (@username, @password_hash, @role)
    `);

  const devHash = await bcrypt.hash('Device@1234', 12);

  console.log('Seeding 200 vehicles and device users...');
  const vehicleIds = [];
  for (let i = 1; i <= 200; i++) {
    const reg      = `WP ${String(i).padStart(4, '0')}`;
    const deviceId = `DEVICE-${String(i).padStart(4, '0')}`;
    const distId   = distIds[i % distIds.length];

    const { recordset } = await pool.request()
      .input('reg',      sql.NVarChar, reg)
      .input('name',     sql.NVarChar, `Driver ${i}`)
      .input('nic',      sql.NVarChar, `${700000000 + i}V`)
      .input('contact',  sql.NVarChar, `07${String(randI(10000000, 99999999))}`)
      .input('dist',     sql.Int,      distId)
      .input('deviceId', sql.NVarChar, deviceId)
      .query(`
        INSERT INTO vehicles
          (registration_number, driver_name, driver_nic,
           contact_number, district_id, device_id, status)
        OUTPUT INSERTED.id
        VALUES
          (@reg, @name, @nic, @contact, @dist, @deviceId, 'active')
      `);

    vehicleIds.push(recordset[0].id);

    await pool.request()
      .input('username',      sql.NVarChar, deviceId)
      .input('password_hash', sql.NVarChar, devHash)
      .input('role',          sql.NVarChar, 'device')
      .query(`
        INSERT INTO users (username, password_hash, role)
        VALUES (@username, @password_hash, @role)
      `);
  }

  console.log('Seeding 7 days of location history...');
  const now          = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  let totalRows      = 0;
  let batchValues    = [];

  const flushBatch = async () => {
    if (batchValues.length === 0) return;
    const valueStr = batchValues.join(',\n');
    await pool.request().query(`
      INSERT INTO location_pings
        (vehicle_id, latitude, longitude, speed, heading, pinged_at)
      VALUES ${valueStr}
    `);
    batchValues = [];
    process.stdout.write('.');
  };

  for (const vid of vehicleIds) {
    let lat = 7.8731 + rand(-1.5, 1.5);
    let lng = 80.7718 + rand(-1.5, 1.5);
    let t   = new Date(sevenDaysAgo);

    while (t <= now) {
      lat += rand(-0.005, 0.005);
      lng += rand(-0.005, 0.005);

      const speed   = parseFloat(rand(0, 80).toFixed(2));
      const heading = parseFloat(rand(0, 360).toFixed(2));
      const latF    = parseFloat(lat.toFixed(8));
      const lngF    = parseFloat(lng.toFixed(8));
      const dateStr = t.toISOString().replace('T', ' ').replace('Z', '');

      batchValues.push(
        `(${vid}, ${latF}, ${lngF}, ${speed}, ${heading}, '${dateStr}')`
      );
      totalRows++;
      t = new Date(t.getTime() + 30 * 60 * 1000);

      if (batchValues.length >= 500) {
        await flushBatch();
      }
    }
  }

  await flushBatch();

  console.log(`\n\nSeed complete!`);
  console.log(`Total pings inserted: ~${totalRows}`);
  console.log(`\nAdmin  →  username: admin        password: Admin@1234`);
  console.log(`Device →  username: DEVICE-0001  password: Device@1234`);

  await sql.close();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});