import dotenv from 'dotenv';
dotenv.config();

const BASE         = process.env.API_URL || 'http://localhost:3000';
const DEV_PASSWORD = 'Device@1234';
const DEVICE_COUNT = 10;
const INTERVAL_MS  = 5000;

const rand = (min, max) => Math.random() * (max - min) + min;

async function login(username, password) {
  const res  = await fetch(`${BASE}/api/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!data.token)
    throw new Error(`Login failed for ${username}: ${JSON.stringify(data)}`);
  return data.token;
}

async function sendPing(token, vehicleId, lat, lng, speed, heading) {
  const res = await fetch(`${BASE}/api/locations/ping`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      vehicle_id: vehicleId,
      latitude:   parseFloat(lat.toFixed(6)),
      longitude:  parseFloat(lng.toFixed(6)),
      speed:      parseFloat(speed.toFixed(1)),
      heading:    parseFloat(heading.toFixed(1)),
    }),
  });
  return res.status;
}

async function main() {
  console.log(`API: ${BASE}`);
  console.log(`Authenticating ${DEVICE_COUNT} devices...\n`);

  const devices = [];
  for (let i = 1; i <= DEVICE_COUNT; i++) {
    const deviceId = `DEVICE-${String(i).padStart(4, '0')}`;
    const token    = await login(deviceId, DEV_PASSWORD);
    devices.push({
      deviceId,
      vehicleId: i,
      token,
      lat:     6.9271 + rand(-0.8, 0.8),
      lng:     79.8612 + rand(-0.8, 0.8),
      heading: rand(0, 360),
    });
    console.log(`  ${deviceId} ready`);
  }

  console.log(`\nSending pings every ${INTERVAL_MS / 1000}s — Ctrl+C to stop\n`);

  setInterval(async () => {
    const time = new Date().toLocaleTimeString();
    for (const d of devices) {
      d.lat     += rand(-0.003, 0.003);
      d.lng     += rand(-0.003, 0.003);
      d.heading  = (d.heading + rand(-10, 10) + 360) % 360;
      const speed  = rand(0, 70);
      const status = await sendPing(
        d.token, d.vehicleId, d.lat, d.lng, speed, d.heading
      );
      console.log(
        `[${time}] ${d.deviceId}` +
        `  lat=${d.lat.toFixed(4)} lng=${d.lng.toFixed(4)}` +
        `  ${speed.toFixed(1)}km/h  ${d.heading.toFixed(0)}°` +
        `  HTTP ${status}`
      );
    }
    console.log('---');
  }, INTERVAL_MS);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});