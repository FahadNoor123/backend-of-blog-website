import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import cookieParser from 'cookie-parser';
import express from 'express';
import { app } from './src/app.js'; // Corrected import


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
