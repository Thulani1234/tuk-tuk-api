import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.CSV_PORT || 3001;

// Serve static files from csv-data directory
app.use('/csv', express.static(path.join(__dirname, 'scripts', 'csv-data')));

// Add CORS headers to allow access from any origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Root endpoint to show available files
app.get('/', (req, res) => {
  const fs = require('fs');
  const csvDir = path.join(__dirname, 'scripts', 'csv-data');
  
  try {
    const files = fs.readdirSync(csvDir).filter(file => file.endsWith('.csv'));
    res.json({
      message: 'CSV File Server',
      available_files: files.map(file => ({
        name: file,
        url: `${req.protocol}://${req.get('host')}/csv/${file}`
      })),
      complete_database_url: `${req.protocol}://${req.get('host')}/csv/tuktuk-database-complete.csv`
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to read CSV directory' });
  }
});

app.listen(PORT, () => {
  console.log(`\n📁 CSV Server running at http://localhost:${PORT}`);
  console.log(`🔗 Complete Database CSV: http://localhost:${PORT}/csv/tuktuk-database-complete.csv`);
  console.log(`📋 Available files: http://localhost:${PORT}\n`);
});
