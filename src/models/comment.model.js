import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    likes: { type: Number, default: 0 },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // Parent reference

    likedByUser: { type: Boolean, default: false },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // Nested replies
}, { timestamps: true });

export const Comment = mongoose.model('Comment', commentSchema);

