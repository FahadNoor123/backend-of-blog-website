const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional
    timeSpent: { type: Number, required: true }, // Time in milliseconds
    timestamp: { type: Date, default: Date.now }
});

const TimeLog = mongoose.model("TimeLog", timeSchema);

module.exports = TimeLog;
