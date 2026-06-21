-- Run this query manually in your Neon SQL Editor to clear out old Umami analytics data
-- and keep your free 500MB database tier under the limit.

-- This deletes any tracking events older than 3 days.
DELETE FROM website_event 
WHERE created_at < NOW() - INTERVAL '3 days';

-- Note: This deletes individual click/view events. Umami will still retain the 
-- aggregated statistics (which are very small in size) if you run this, 
-- but you lose the granular individual event logs for things older than 3 days.
