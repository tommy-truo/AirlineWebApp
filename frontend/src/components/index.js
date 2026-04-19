/* Abhishek Singh - ACME Backend Server */
import express from 'express';
import employeeRoutes from './routes/empDashRoutes.js'; 

const app = express();

// Manual CORS fix (No extra install needed)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allows Vite to talk to Node
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());
app.use('/api/employee', employeeRoutes);

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is alive at http://localhost:${PORT}`);
});