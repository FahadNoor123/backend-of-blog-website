import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import cookieParser from 'cookie-parser';
import express from 'express';
import { app } from './src/app.js'; // Corrected import

import blogScheduler from "./utils/blogScheduler.js";// Import the scheduler

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




app.get("/api/cron/publish-blogs", async (req, res) => {

  try {

    // Security check (important)
    if (req.headers["x-vercel-cron"] !== "1") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await blogScheduler.checkAndPublishScheduledBlogs();

    res.json({
      message: "Cron executed successfully",
      result
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
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
