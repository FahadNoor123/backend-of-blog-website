import { Router } from "express";
import { createBlog, getBlogs, getBlogBySlug,getRelatedBlogs} from "../controllers/blog.controller.js";
import {uploadProfileImage } from '../middlewares/multer.middleware.js';


const router = Router()

router.route("/createblog").post(  uploadProfileImage.array('blogImage'), // Use uploadAvatar middleware for single file upload of 'avatar' field
createBlog)

router.route("/getblogs").get( getBlogs)

router.route("/getblog/:slug").get(getBlogBySlug);

router.route("/related").get(getRelatedBlogs);

export default router