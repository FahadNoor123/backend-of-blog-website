import { Router } from "express";
import { createBlog, getBlogs, getBlogBySlug} from "../controllers/blog.controller.js";
import {uploadProfileImage } from '../middlewares/multer.middleware.js';
import { editBlog} from "../controllers/adminBlog.controller.js";

import {adminMiddleware } from '../middlewares/admin.middlerware.js';


const router = Router()

// 🔐 Protect all admin routes
router.use(adminMiddleware);

router.route("/createblog").post(  uploadProfileImage.array('blogImage'), // Use uploadAvatar middleware for single file upload of 'avatar' field
createBlog)

router.route("/getblogs").get( getBlogs)

router.route("/getblog/:slug").get(getBlogBySlug);
router.route("/editblog/:slug").put(uploadProfileImage.array('blogImage'),editBlog);

export default router