# Blog Auto-Publishing Scheduler

This scheduler automatically publishes blog posts when their scheduled time is reached.

## How It Works

1. **Scheduling**: When creating/editing a blog, set `postStatus: 'Scheduled'` and `scheduledAt: futureDate`
2. **Monitoring**: The scheduler runs every minute checking for blogs where `scheduledAt <= currentTime`
3. **Publishing**: Matching blogs are automatically updated to `postStatus: 'Published'` with `publishedAt` timestamp
4. **Visibility**: Published blogs become visible to the public

## API Endpoints

### Check Scheduler Status
```
GET /api/scheduler/status
```
Response:
```json
{
  "isRunning": true,
  "nextRun": "Every minute"
}
```

### Manual Trigger (Testing)
```
POST /api/scheduler/trigger
```
Triggers an immediate check for scheduled blogs.

## Testing the Scheduler

1. Create a blog and schedule it for 2 minutes in the future
2. Check the admin panel - it should show "Scheduled" status
3. Wait 2 minutes or manually trigger: `POST /api/scheduler/trigger`
4. Blog should automatically become "Published"

## Logs

The scheduler logs all activities:
- `🔍 [timestamp] Checking for scheduled blogs...`
- `📊 Found X blog(s) ready for publishing`
- `✅ Published: "Blog Title" (ID: xxx)`
- `❌ Failed to publish "Blog Title": error message`

## Configuration

- **Frequency**: Every minute (`*/5 * * * *`)
- **Timezone**: Server timezone (UTC by default)
- **Status Check**: `postStatus: 'Scheduled'` and `scheduledAt <= now`