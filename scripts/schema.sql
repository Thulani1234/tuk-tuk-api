-- Create database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'tuktuk_db')
  CREATE DATABASE tuktuk_db;
GO

USE tuktuk_db;
GO

-- Drop tables if they exist (correct order)
IF OBJECT_ID('location_pings',  'U') IS NOT NULL DROP TABLE location_pings;
IF OBJECT_ID('vehicles',        'U') IS NOT NULL DROP TABLE vehicles;
IF OBJECT_ID('users',           'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID('police_stations', 'U') IS NOT NULL DROP TABLE police_stations;
IF OBJECT_ID('districts',       'U') IS NOT NULL DROP TABLE districts;
IF OBJECT_ID('provinces',       'U') IS NOT NULL DROP TABLE provinces;
GO

-- Provinces
CREATE TABLE provinces (
  id   INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL UNIQUE,
  code NVARCHAR(10)  NOT NULL UNIQUE
);

-- Districts
CREATE TABLE districts (
  id          INT IDENTITY(1,1) PRIMARY KEY,
  name        NVARCHAR(100) NOT NULL,
  province_id INT NOT NULL,
  FOREIGN KEY (province_id) REFERENCES provinces(id)
);

-- Police Stations
CREATE TABLE police_stations (
  id          INT IDENTITY(1,1) PRIMARY KEY,
  name        NVARCHAR(150) NOT NULL,
  district_id INT NOT NULL,
  address     NVARCHAR(255) NULL,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Users
CREATE TABLE users (
  id            INT IDENTITY(1,1) PRIMARY KEY,
  username      NVARCHAR(100) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  role          NVARCHAR(30)  NOT NULL DEFAULT 'station_user'
                CONSTRAINT chk_role CHECK (
                  role IN ('hq_admin','provincial_admin','station_user','device')
                ),
  station_id    INT NULL,
  created_at    DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (station_id) REFERENCES police_stations(id)
);

-- Vehicles
CREATE TABLE vehicles (
  id                  INT IDENTITY(1,1) PRIMARY KEY,
  registration_number NVARCHAR(20)  NOT NULL UNIQUE,
  driver_name         NVARCHAR(150) NULL,
  driver_nic          NVARCHAR(20)  NULL,
  contact_number      NVARCHAR(20)  NULL,
  district_id         INT NULL,
  status              NVARCHAR(20) DEFAULT 'active'
                      CONSTRAINT chk_status CHECK (
                        status IN ('active','inactive','flagged')
                      ),
  device_id           NVARCHAR(100) NULL UNIQUE,
  registered_at       DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Location Pings
CREATE TABLE location_pings (
  id         BIGINT IDENTITY(1,1) PRIMARY KEY,
  vehicle_id INT           NOT NULL,
  latitude   DECIMAL(10,8) NOT NULL,
  longitude  DECIMAL(11,8) NOT NULL,
  speed      DECIMAL(5,2)  NULL,
  heading    DECIMAL(5,2)  NULL,
  pinged_at  DATETIME2     DEFAULT GETDATE(),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Indexes
CREATE INDEX idx_vehicle_pinged ON location_pings(vehicle_id, pinged_at DESC);
CREATE INDEX idx_pinged_at      ON location_pings(pinged_at DESC);
CREATE INDEX idx_vehicle_status ON vehicles(status);
GO

PRINT 'Schema created successfully';