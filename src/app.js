import express from "express";

import cookieParser from "cookie-parser";
import userRouter from './routes/user.routes.js';
import blogRouter from './routes/blog.routes.js';
import adminRouter from './routes/admin.routes.js';
import commentRouter from './routes/comments.routes.js';

import cors from 'cors';
 
 const app = express();
 app.use(cors({
  origin: "https://global-newscom.vercel.app/",  // Replace with your frontend URL(s)
  credentials: true,  // Allow cookies and authorization headers
  methods: ["GET", "POST", "PUT", "DELETE"],  // Allow these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"],  // Specify allowed headers
}));


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());




app.use("/api/v1/users", userRouter);

app.use("/api/v1/blog", blogRouter);


app.use("/api/v1/blog/admin", adminRouter);
app.use("/api/v1/blog/comment", commentRouter);

export { app };
