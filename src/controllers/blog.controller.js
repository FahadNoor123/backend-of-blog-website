import { Blog } from "../models/blog.model.js";
import sanitizeHtml from 'sanitize-html';




// Create a new blog (Admin only)
const createBlog = async (req, res) => {
  

    try {
        console.log("Request Body:", req.body); // Debugging log

        const { title, content, category, metaTitle, metaDescription, keywords, slug, tags, externalLinks, isFeatured } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        if (!category) {
            return res.status(400).json({ message: "Category is required" });
        }

        if (!metaTitle) {
            return res.status(400).json({ message: "Meta title is required for SEO" });
        }

        if (!metaDescription) {
            return res.status(400).json({ message: "Meta description is required for SEO" });
        }

        if (!slug) {
            return res.status(400).json({ message: "Slug is required" });
        }

        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return res.status(400).json({ message: "At least one keyword is required" });
        }

        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return res.status(400).json({ message: "At least one tag is required" });
        }

// Sanitize content to prevent XSS
const sanitizedContent = sanitizeHtml(content, {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', // Heading tags
    'b', 'i', 'em', 'strong', 'p', 'a', 'ul', 'ol', 'li', 'br', 'img', 'mark', 'span','u','code','blockquote'
  ],
  allowedAttributes: {
    'a': ['href', 'target'],
    'img': ['src', 'alt'],
    'span': ['class', 'style'],
    'mark': []
  },
  allowedClasses: {
    'span': ['highlight']
  },
  allowedSchemes: ['http', 'https', 'data'],
  allowedStyles: {
    'span': {
      // Allow color and background-color styles
      'color': [/^#(0x)?[0-9a-fA-F]+$/i, /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/],
      'background-color': [/^#(0x)?[0-9a-fA-F]+$/i, /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/]
    }
  }
});


        // ✅ Ensure slug is unique
      // ✅ Normalize slug to prevent case-sensitive duplicates
      const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-"); // Convert spaces to hyphens

      // ✅ Check if slug already exists in DB
      const existingSlug = await Blog.findOne({ slug: normalizedSlug });
      if (existingSlug) {
          return res.status(400).json({ message: "Slug already exists. Choose another." });
      }
      if (!req.files) {
        return res.status(400).json({ message: "Image Required For Blog" });
    }
      console.log("Final Slug Before Saving:", normalizedSlug); // Debugging log
       
        // ✅ Handle Image Upload (Cloudinary)
        let  blogImage = [];
        if (req.files && req.files.length > 0) {
            blogImage = req.files.map((file) => file.path); // Extract Cloudinary URLs
        }
       
        const blog = new Blog({
            title,
            slug: normalizedSlug, 
            content:sanitizedContent,
            category,
            author: req.user ? req.user._id : null, // Handle case where user is not available
            blogImage,
            metaTitle,
            metaDescription,
            keywords,
            tags,
            externalLinks,
            isFeatured,
            isPublished: true,
            publishedAt: new Date(),
        });

        await blog.save();

        return res.status(201).json({ message: "Blog created successfully", blog });

    } catch (error) {
        console.error("Error in createBlog:", error); // ✅ Logs error to the console

        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};




const getBlogs = async (req, res) => {
  try {
    console.log("get blog hit");

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 blogs per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip
    const category = req.query.category || null; // Get category from query params

    console.log("Category received:", category);
    const categories = await Blog.distinct("category");
    console.log("Available Categories in DB:", categories);
    
    // Apply category filter if provided
    const filter = category ? { category: { $regex: `^${category}$`, $options: "i" } } : {};

    // Fetch blogs with pagination & category filter
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total number of blogs in this category
    const totalBlogs = await Blog.countDocuments(filter);

    console.log(`Fetched ${blogs.length} blogs for category: ${category}`);

    res.status(200).json({
      success: true,
      latest: blogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}



// ✅ Fetch a specific blog by slug
const getBlogBySlug = async (req, res) => {
  try {
    console.log("Slug route hitted",req.params)
    const { slug } = req.params; // Extract slug from URL params

    // Find the blog by its slug
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch Related Blog
 const getRelatedBlogs = async (req, res) => {
  try {
    console.log("Relate Blog hitted" )
    const { category, slug } = req.query;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    // Fetch blogs with the same category
    const blogs = await Blog.find({ category }).limit(5);

    // Exclude the current blog from the results
    const filteredBlogs = blogs.filter(blog => blog.slug !== slug);

    res.status(200).json(filteredBlogs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};








    export {
        createBlog,
        getBlogs,
        getBlogBySlug,
        getRelatedBlogs
    }