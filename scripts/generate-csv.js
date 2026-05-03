import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = path.join(__dirname, 'csv-data');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Data from seed.js
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

// Utility functions
const rand = (min, max) => Math.random() * (max - min) + min;
const randI = (min, max) => Math.floor(rand(min, max));

// Generate sample vehicles
function generateVehicles(count = 50) {
  const vehicles = [];
  const districts = districts.map(d => d.name);
  
  for (let i = 1; i <= count; i++) {
    const reg = `WP ${String(i).padStart(4, '0')}`;
    const deviceId = `DEVICE-${String(i).padStart(4, '0')}`;
    const district = districts[i % districts.length];
    
    vehicles.push({
      id: i,
      registration_number: reg,
      driver_name: `Driver ${i}`,
      driver_nic: `${700000000 + i}V`,
      contact_number: `07${String(randI(10000000, 99999999))}`,
      district: district,
      device_id: deviceId,
      status: 'active'
    });
  }
  
  return vehicles;
}

// Generate sample location pings
function generateLocationPings(vehicleCount = 10, pingsPerVehicle = 20) {
  const pings = [];
  const now = new Date();
  
  for (let vehicleId = 1; vehicleId <= vehicleCount; vehicleId++) {
    let lat = 7.8731 + rand(-1.5, 1.5);
    let lng = 80.7718 + rand(-1.5, 1.5);
    
    for (let ping = 0; ping < pingsPerVehicle; ping++) {
      lat += rand(-0.005, 0.005);
      lng += rand(-0.005, 0.005);
      
      const speed = parseFloat(rand(0, 80).toFixed(2));
      const heading = parseFloat(rand(0, 360).toFixed(2));
      const timestamp = new Date(now - (ping * 30 * 60 * 1000)); // 30 minutes apart
      
      pings.push({
        vehicle_id: vehicleId,
        latitude: parseFloat(lat.toFixed(8)),
        longitude: parseFloat(lng.toFixed(8)),
        speed: speed,
        heading: heading,
        pinged_at: timestamp.toISOString().replace('T', ' ').replace('Z', '')
      });
    }
  }
  
  return pings.sort((a, b) => new Date(b.pinged_at) - new Date(a.pinged_at));
}

// Convert array of objects to CSV
function arrayToCSV(data, headers) {
  if (data.length === 0) return '';
  
  const headerRow = headers.join(',');
  const dataRows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}

// Write CSV file
function writeCSV(filename, data, headers) {
  const csv = arrayToCSV(data, headers);
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, csv, 'utf8');
  console.log(`Created: ${filePath}`);
}

// Generate all CSV files
function generateAllCSVs() {
  console.log('Generating CSV files...\n');
  
  // Provinces CSV
  writeCSV('provinces.csv', provinces, ['name', 'code']);
  
  // Districts CSV
  writeCSV('districts.csv', districts, ['name', 'province']);
  
  // Police Stations CSV
  writeCSV('police_stations.csv', stations, ['name', 'district']);
  
  // Sample Vehicles CSV
  const vehicles = generateVehicles(50);
  writeCSV('vehicles.csv', vehicles, [
    'id', 'registration_number', 'driver_name', 'driver_nic', 
    'contact_number', 'district', 'device_id', 'status'
  ]);
  
  // Sample Location Pings CSV
  const locationPings = generateLocationPings(10, 20);
  writeCSV('location_pings.csv', locationPings, [
    'vehicle_id', 'latitude', 'longitude', 'speed', 'heading', 'pinged_at'
  ]);
  
  console.log(`\nAll CSV files generated in: ${outputDir}`);
  console.log('\nFiles created:');
  console.log('- provinces.csv');
  console.log('- districts.csv');
  console.log('- police_stations.csv');
  console.log('- vehicles.csv (50 sample vehicles)');
  console.log('- location_pings.csv (200 sample pings)');
}

// Run the generator
generateAllCSVs().catch(err => {
  console.error('Error generating CSV files:', err);
  process.exit(1);
});
