import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true, // ✅ Slug is now mandatory
      unique: true, // ✅ Ensures no duplicate slugs
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Technology", "Education", "Health", "Business", "Other", "News"],
    },
    blogImage: {
      type: [String], // URL of blog image
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    metaTitle: {
        type: String,
        trim: true,
        required: true,
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: 160, // Ideal SEO description length
        required: true,
      },
    keywords: {
      type: [String], // Array of relevant keywords
      index: true,
      required: true,
    },
    tags: {
        type: [String], // Helps in related blog suggestions
        index: true,
        required: true,
      },
      externalLinks: [
        {
          label: String, // Display text for the link
          url: String, // External website URL
        },
      ],
      isFeatured: 
      { 
        type: Boolean, 
        default: false 
    }, // ✅ Featured Story Field
    postStatus: { 
      type: String, 
      enum: ['Draft', 'Published', 'Scheduled'], 
      default: 'Draft' 
    },
    scheduledAt: { 
      type: Date 
    }, // For scheduling posts
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdAt: { type: Date, default: Date.now },

    updatedAt: { type: Date, default: Date.now },

    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Middleware to update 'updatedAt' on save
blogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
export const Blog = mongoose.model("Blog", blogSchema);
