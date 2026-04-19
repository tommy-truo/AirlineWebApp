// Written by Tommy Truong

import dotenv from 'dotenv'; 
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get absolute file path for .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Check for SSL CA Cert
const getSslConfig = () => {
  if (!process.env.DB_SSL_CERT) return false;

  const certPath = path.resolve(__dirname, process.env.DB_SSL_CERT);
  
  if (fs.existsSync(certPath)) {
    return {
      ca: fs.readFileSync(certPath),
      rejectUnauthorized: true
    };
  }
  console.warn("SSL CA Cert defined in .env but file not found at:", certPath);
  return false;
};

// Create pool of MySQL connections for async
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  timezone: 'local',
  
  // SSL CA Certification (necessary to authorize access to DB)
  ssl: getSslConfig(),

  // Converts Dates to Strings
  dateStrings: true,

  // Pool config variables
  enableKeepAlive: true,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 50
});