# Tuk-Tuk API CSV Data Files

This directory contains CSV files with sample data for the Tuk-Tuk Tracking API demonstration.

## Files Description

### provinces.csv
Contains Sri Lankan provinces with their codes.
- Columns: `name`, `code`
- Records: 9 provinces

### districts.csv
Contains Sri Lankan districts mapped to their provinces.
- Columns: `name`, `province`
- Records: 25 districts

### police_stations.csv
Contains police stations mapped to their districts.
- Columns: `name`, `district`
- Records: 25 police stations

### vehicles.csv
Sample vehicle data for demonstration.
- Columns: `id`, `registration_number`, `driver_name`, `driver_nic`, `contact_number`, `district`, `device_id`, `status`
- Records: 50 sample vehicles

### location_pings.csv
Sample location tracking data for demonstration.
- Columns: `vehicle_id`, `latitude`, `longitude`, `speed`, `heading`, `pinged_at`
- Records: 50 location pings (10 vehicles × 5 pings each)

## Usage

These CSV files can be used to:
- Import data into the database using the seed script
- Create visualizations and reports
- Test API endpoints with realistic data
- Demonstrate the tracking system functionality

## Data Generation

The CSV files were generated based on the seed data structure in `../seed.js`. The location data uses realistic Sri Lankan coordinates and the timestamps are set for demonstration purposes.

## Coordinates
The latitude and longitude values are based on real Sri Lankan locations:
- Colombo area: ~6.9°N, 79.8°E
- Kandy area: ~7.3°N, 80.6°E
- Galle area: ~6.0°N, 80.2°E
- Jaffna area: ~9.6°N, 80.0°E
- And other major cities across Sri Lanka
