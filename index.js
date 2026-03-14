import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import cookieParser from 'cookie-parser';
import express from 'express';
import { app } from './src/app.js'; // Corrected import
import BlogScheduler from './src/utils/blogScheduler.js'; // Import the scheduler


dotenv.config({
    path: './.env'
});
// app.use(session({
//     secret: '1233456', // Replace with your own secret key
//     resave: false,
//     saveUninitialized: false,
//   }));
// const allowedOrigins = [
//     'https://vercel-project-kappa.vercel.app',
//     // Add more origins if needed
// ];

app.use(cookieParser());



  
  


app.get('/', (req, res) => {
    res.send('Server is Ready');
});

app.use(express.json());




// Add scheduler management endpoints (before DB connection)
let scheduler; // Declare globally

app.get('/api/scheduler/status', (req, res) => {
    if (scheduler) {
        res.json(scheduler.getStatus());
    } else {
        res.json({ isRunning: false, message: 'Scheduler not initialized' });
    }
});

app.post('/api/scheduler/trigger', async (req, res) => {
    try {
        if (scheduler) {
            await scheduler.triggerManualCheck();
            res.json({ message: 'Manual scheduler check completed' });
        } else {
            res.status(500).json({ error: 'Scheduler not initialized' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
            app.get('/api/check-connection', (req, res) => {
                res.json({ message: 'Frontend and backend are connected!' });
            });
        });
    })
    .catch((err) => {
        console.log("MONGO db connection faileds !!! ", err);
    });
