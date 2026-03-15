import { Blog } from '../models/blog.model.js';

class BlogScheduler {

  // Check for scheduled blogs and publish them
  async checkAndPublishScheduledBlogs() {
    try {
      const now = new Date();
      console.log(`🔍 [${now.toISOString()}] Checking for scheduled blogs...`);

      const blogsToPublish = await Blog.find({
        postStatus: "Scheduled",
        scheduledAt: { $lte: now }
      });

      console.log(`📊 Found ${blogsToPublish.length} blog(s) ready for publishing`);

      if (!blogsToPublish.length) {
        return {
          success: true,
          message: "No blogs to publish",
          published: 0
        };
      }

      let successCount = 0;
      let errorCount = 0;

      for (const blog of blogsToPublish) {
        try {
          blog.postStatus = "Published";
          blog.publishedAt = new Date();

          await blog.save();

          console.log(`✅ Published: "${blog.title}"`);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to publish "${blog.title}":`, error.message);
          errorCount++;
        }
      }

      console.log(`🎉 Scheduler completed: ${successCount} published`);

      return {
        success: true,
        published: successCount,
        errors: errorCount
      };

    } catch (error) {
      console.error("❌ Scheduler error:", error.message);

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Manual trigger
  async triggerManualCheck() {
    console.log("🔧 Manual trigger started");
    return await this.checkAndPublishScheduledBlogs();
  }

}

export default new BlogScheduler();