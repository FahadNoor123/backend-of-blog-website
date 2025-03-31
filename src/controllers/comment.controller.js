import { Comment } from "../models/comment.model.js";
import { Blog } from "../models/blog.model.js";
const createComment = async (req, res) => {
    try {
        console.log("route hiited",req.body)
        const { content, blog: slug, parent } = req.body;
    const userId = req.user._id; // Ensure user ID is available from auth middleware
const blog = await Blog.findOne({ slug }).select("_id");
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
        // 🟢 Naya comment create karna
        const newComment = await Comment.create({
            content,
            user: userId,

            blog: blog._id, // Use ObjectId from the blog document

            parent: parent || null // 🛠 Ensure karo parent id sahi set ho
        });

        // 🟢 Agar yeh reply hai to parent comment me isko replies array me push karo
        if (parent) {
            await Comment.findByIdAndUpdate(parent, {
                $push: { replies: newComment._id }
            });
        }

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: newComment
        });

    } catch (error) {
        console.error("Error in adding comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
const getCommentAndLike = async (req, res) => {
    try {
        // 🟢 1. Find the Blog by slug
        const blog = await Blog.findOne({ slug: req.params.slug });

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // 🟢 2. Fetch only parent comments (not replies separately)
        const allComments = await Comment.find({ blog: blog._id, parent: null }) // 🎯 Only fetch parent comments
            .populate("user", "-password -refreshToken")
            .populate({
                path: "replies",
                populate: { 
                    path: "user", 
                    select: "-password -refreshToken" 
                }, // Populate user inside replies
            })
            .exec();

        res.status(200).json(allComments);
    } catch (error) {
        console.error("Error in fetching comments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export { 
    createComment, 
    getCommentAndLike 
};
