import cron from 'node-cron';
import { Blog } from '../models/blog.model.js';

class BlogScheduler {
  constructor() {
    this.isRunning = false;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('Blog scheduler is already running');
      return;
    }

    console.log('🚀 Starting Blog Scheduler...');

    // Run every 5 minutes to check for blogs that need to be published
    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.checkAndPublishScheduledBlogs();
      } catch (error) {
        console.error('❌ Error in blog scheduler:', error);
      }
    });

    this.isRunning = true;
    console.log('✅ Blog scheduler started successfully');
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      console.log('Blog scheduler is not running');
      return;
    }

    // Note: cron jobs are persistent, but we can mark as stopped
    this.isRunning = false;
    console.log('🛑 Blog scheduler stopped');
  }

  // Check for scheduled blogs and publish them
  async checkAndPublishScheduledBlogs() {
    try {
      const now = new Date();
      console.log(`🔍 [${now.toISOString()}] Checking for scheduled blogs...`);

      // Find blogs that are scheduled and their time has come
      const blogsToPublish = await Blog.find({
        postStatus: 'Scheduled',
        scheduledAt: { $lte: now }
      });

      console.log(`📊 Found ${blogsToPublish.length} blog(s) ready for publishing`);

      if (blogsToPublish.length === 0) {
        return; // No blogs to publish
      }

      // Publish each blog
      let successCount = 0;
      let errorCount = 0;

      for (const blog of blogsToPublish) {
        try {
          // Update the blog status
          blog.postStatus = 'Published';
          blog.publishedAt = new Date();
          await blog.save();

          console.log(`✅ Published: "${blog.title}" (ID: ${blog._id}) at ${new Date().toISOString()}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to publish "${blog.title}":`, error.message);
          errorCount++;
        }
      }

      console.log(`🎉 Scheduler run completed: ${successCount} published, ${errorCount} errors`);
    } catch (error) {
      console.error('❌ Error in blog scheduler check:', error.message);
    }
  }

  // Get status of scheduler
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.isRunning ? 'Every minute' : 'Not running'
    };
  }

  // Manual trigger for testing
  async triggerManualCheck() {
    console.log('🔧 Manual trigger: Checking scheduled blogs...');
    await this.checkAndPublishScheduledBlogs();
    console.log('✅ Manual check completed');
  }
}

export default BlogScheduler;