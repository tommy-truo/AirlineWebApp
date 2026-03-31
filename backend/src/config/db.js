import mysql from 'mysql2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const rawPath = process.env.DB_SSL_CERT || 'certs/digicert.pem';
const certRelativePath = rawPath.replace(/\\/g, '/');


const certPath = path.resolve(__dirname, '../../', process.env.DB_SSL_CERT);


if (!fs.existsSync(certPath)) {
    console.error(`❌ SSL Certificate NOT FOUND at: ${certPath}`);
    process.exit(1); 
}

export const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    ca: fs.readFileSync(certPath),
    rejectUnauthorized: true
  },
});

export const db = connection.promise();