import { Blog } from "../models/blog.model.js";
import sanitizeHtml from 'sanitize-html';
import cloudinary from "cloudinary";
import path from "path";

// Edit Blog Post Controller
const editBlog = async (req, res) => {
    console.log("Edit route hit", req.body);
    try {
        const { slug } = req.params;
        const {
            title,
            category,
            metaTitle,
            metaDescription,
            keywords,
            tags,
            status,
            scheduleDate,
            content,
        } = req.body;

        // Required field validation
        if (!title) return res.status(400).json({ message: "Title is required" });
        if (!content) return res.status(400).json({ message: "Content is required" });
        if (!category) return res.status(400).json({ message: "Category is required" });
        if (!metaTitle) return res.status(400).json({ message: "Meta title is required for SEO" });
        if (!metaDescription) return res.status(400).json({ message: "Meta description is required for SEO" });
        if (!slug) return res.status(400).json({ message: "Slug is required" });
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0)
            return res.status(400).json({ message: "At least one keyword is required" });
        if (!tags || !Array.isArray(tags) || tags.length === 0)
            return res.status(400).json({ message: "At least one tag is required" });

        // Sanitize content
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
      
      

       
        console.log("These files in reqs:", req.files);
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Image Required For Blog" });
        }

        let blogImage = req.files.map((file) => file.path);

        // Find the blog post
        const blogPost = await Blog.findOne({ slug });

        if (!blogPost) {
            return res.status(404).json({ message: "Blog post not found" });
        }
        console.log("Existing Image URL:", blogPost.blogImage);

        // Delete old images if new images are uploaded
if (req.files?.length > 0 && blogPost.blogImage?.length > 0) {
    try {
        // Loop through all existing images
        for (const oldImageUrl of blogPost.blogImage) {
            if (oldImageUrl) {
                const parts = oldImageUrl.split("/upload/");
                if (parts.length < 2) throw new Error("Invalid Cloudinary URL format");

                // Remove version number (e.g., v1742909759)
                const pathSegments = parts[1].split("/");
                pathSegments.shift(); // Remove the version number

                // Get public ID without file extension
                const publicId = pathSegments.join("/").replace(/\.[^/.]+$/, "");

                console.log("✅ Deleting Cloudinary Image:", publicId);

                // Delete the image from Cloudinary
                const result = await cloudinary.uploader.destroy(publicId);
                console.log("✅ Cloudinary Deletion Result:", result);
            }
        }
    } catch (error) {
        console.error("❌ Error Deleting Cloudinary Images:", error.message);
    }
}





         // ✅ Normalize slug to prevent case-sensitive duplicates
         let normalizedSlug = slug; // Default to current slug
         if (req.body.slug) {
             normalizedSlug = req.body.slug.trim().toLowerCase().replace(/\s+/g, "-");
             console.log("this is new slug", normalizedSlug);
 
             // Check if the new slug is already taken
             const existingBlog = await Blog.findOne({ slug: normalizedSlug });
             if (existingBlog && existingBlog._id.toString() !== blogPost._id.toString()) {
                 return res.status(400).json({ message: "Slug already in use, choose another one" });
             }
         }
        
        // Update fields
        blogPost.title = title || blogPost.title;
        blogPost.category = category || blogPost.category;
        blogPost.metaTitle = metaTitle || blogPost.metaTitle;
        blogPost.metaDescription = metaDescription || blogPost.metaDescription;
        blogPost.keywords = keywords || blogPost.keywords;
        blogPost.tags = tags || blogPost.tags;
        blogPost.status = status || blogPost.status;
        blogPost.scheduleDate = scheduleDate ? new Date(scheduleDate) : blogPost.scheduleDate;
        blogPost.content = sanitizedContent || blogPost.content;
        blogPost.blogImage = blogImage || blogPost.blogImage;
        blogPost.slug = normalizedSlug || blogPost.slug;

        await blogPost.save();
        res.status(200).json({ message: "Blog post updated successfully", blogPost });

    } catch (error) {
        console.error("Error updating blog post:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { editBlog };
