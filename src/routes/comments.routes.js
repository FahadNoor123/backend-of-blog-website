import { Router } from "express";

import { createComment, getCommentAndLike} from "../controllers/comment.controller.js";
import {adminMiddleware } from '../middlewares/admin.middlerware.js';





const router = Router()
router.use(adminMiddleware);

router.route("/addcomment/:slug").post(createComment);

router.route("/getCommentAndLike/:slug").get( getCommentAndLike);


export default router