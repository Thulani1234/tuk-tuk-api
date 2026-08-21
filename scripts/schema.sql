-- Drop tables if they exist  
DROP TABLE IF EXISTS location_pings CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS police_stations CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;

-- Provinces
CREATE TABLE provinces (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10)  NOT NULL UNIQUE
);

-- Districts
CREATE TABLE districts (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  province_id INT NOT NULL,
  FOREIGN KEY (province_id) REFERENCES provinces(id)
);

-- Police Stations
CREATE TABLE police_stations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  district_id INT NOT NULL,
  address     VARCHAR(255) NULL,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Users
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(30)  NOT NULL DEFAULT 'station_user'
                CONSTRAINT chk_role CHECK (
                  role IN ('hq_admin','provincial_admin','station_user','device')
                ),
  station_id    INT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (station_id) REFERENCES police_stations(id)
);

-- Vehicles
CREATE TABLE vehicles (
  id                  SERIAL PRIMARY KEY,
  registration_number VARCHAR(20)  NOT NULL UNIQUE,
  driver_name         VARCHAR(150) NULL,
  driver_nic          VARCHAR(20)  NULL,
  contact_number      VARCHAR(20)  NULL,
  district_id         INT NULL,
  status              VARCHAR(20) DEFAULT 'active'
                      CONSTRAINT chk_status CHECK (
                        status IN ('active','inactive','flagged')
                      ),
  device_id           VARCHAR(100) NULL UNIQUE,
  registered_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Location Pings
CREATE TABLE location_pings (
  id         BIGSERIAL PRIMARY KEY,
  vehicle_id INT           NOT NULL,
  latitude   DECIMAL(10,8) NOT NULL,
  longitude  DECIMAL(11,8) NOT NULL,
  speed      DECIMAL(5,2)  NULL,
  heading    DECIMAL(5,2)  NULL,
  pinged_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Indexes
CREATE INDEX idx_vehicle_pinged ON location_pings(vehicle_id, pinged_at DESC);
CREATE INDEX idx_pinged_at      ON location_pings(pinged_at DESC);
CREATE INDEX idx_vehicle_status ON vehicles(status);