import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'; 
import { db } from './config/db.js'; // Import the database instance
import employeeRoutes from './routes/empDashRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);

async function startServer() {
  try {

    await db.query('SELECT 1');
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Database connection failed during startup!');
    console.error(err.message);
    process.exit(1); 
  }
}

startServer();