# Schema Extensions README

This document explains the schema extensions that extend the base `complete_schema.sql` file.

## Overview

The `schema_extensions.sql` file implements all advanced features from the technical plan:
- Hierarchical supplement search (parent-child structure)
- Gamification (XP, streaks, subscription tiers)
- Safety engine (substances/interactions graph)
- Health metrics with time-series partitioning
- Protocols system with Git-like forking
- N-of-1 experiments
- Terra API integration
- CSV import support

## Installation

1. First, run `complete_schema.sql` in your Supabase SQL Editor
2. Then, run `schema_extensions.sql` in the same SQL Editor

The extension file uses `IF NOT EXISTS` and `IF EXISTS` clauses where appropriate to allow safe re-running, but some operations like `ALTER TABLE ADD COLUMN IF NOT EXISTS` are idempotent.

## Key Features

### 1. Hierarchical Supplement Search

**New columns in `supplements` table:**
- `parent_id` - References another supplement as parent
- `is_parent` - Boolean flag indicating if this supplement has variants

**New function:**
- `search_supplements(search_term TEXT)` - Returns parent supplements with aggregated variants as JSONB

**Usage:**
```sql
SELECT * FROM search_supplements('Magnesium');
-- Returns: parent supplements matching "Magnesium" with all variants in variants JSONB array
```

### 2. Gamification

**New columns in `profiles` table:**
- `username` - Unique username
- `xp_total` - Total experience points
- `current_streak` - Current daily streak
- `last_active_at` - Last activity timestamp
- `subscription_tier` - 'free', 'pro', or 'creator'

**Automatic triggers:**
- XP is awarded when tasks are completed, check-ins are logged, or doses are taken
- Streaks are automatically updated based on daily activity

### 3. Safety Engine

**New tables:**
- `substances` - Chemical substances (medicines, supplements, herbs, foods, enzymes)
- `interactions` - Interactions between substances with severity (1-5), mechanism, evidence level
- `supplement_substances` - Junction table linking supplements to substances

**Usage for interaction checking:**
```sql
-- Find all interactions for supplements in a user's stack
SELECT i.*, s1.name as substance_a, s2.name as substance_b
FROM interactions i
JOIN substances s1 ON i.substance_a_id = s1.id
JOIN substances s2 ON i.substance_b_id = s2.id
WHERE s1.id IN (
  SELECT substance_id FROM supplement_substances 
  WHERE supplement_id IN (SELECT supplement_id FROM user_stacks WHERE user_id = $1 AND is_active = true)
);
```

### 4. Health Metrics (Time-Series)

**New table:**
- `health_metrics` - Partitioned by `recorded_at` (monthly partitions)

**Partitioning:**
- Automatically creates partitions for current and next month
- For production, use `pg_partman` extension for automatic partition management

**Usage:**
```sql
-- Insert health metric
INSERT INTO health_metrics (user_id, type, value, unit, source, recorded_at)
VALUES ('user-uuid', 'heart_rate', 72, 'bpm', 'terra', NOW());

-- Query recent metrics
SELECT * FROM health_metrics 
WHERE user_id = 'user-uuid' 
  AND type = 'heart_rate' 
  AND recorded_at > NOW() - INTERVAL '7 days'
ORDER BY recorded_at DESC;
```

### 5. Protocols System

**New tables:**
- `protocols` - User-created supplement protocols (forkable)
- `protocol_access` - Sharing/permissions for protocols
- `protocol_likes` - Likes on protocols

**Forking example:**
```sql
-- Fork a protocol
INSERT INTO protocols (creator_id, forked_from_id, title, protocol_data)
VALUES ('user-uuid', 123, 'My Modified Stack', '{"supplements": [...]}');
-- Automatically increments fork_count on parent protocol via trigger
```

### 6. N-of-1 Experiments

**New table:**
- `experiments` - Stores experiment configuration and results

**Experiment designs supported:**
- 'AB' - Single intervention vs control
- 'ABAB' - Repeated measures design
- 'RCT' - Randomized controlled trial
- 'Crossover' - Crossover design

### 7. Terra API Integration

**New tables:**
- `terra_connections` - Manages connections to wearable devices (Oura, Garmin, etc.)
- `terra_webhook_staging` - Queue for processing Terra webhooks asynchronously

### 8. CSV Import

**Staging tables:**
- `supplement_import_staging` - For importing supplements with parent-child detection
- `substance_import_staging` - For importing substances for safety engine

**Processing functions:**
- `process_supplement_import_batch(batch_id UUID)` - Processes supplement imports
- `process_substance_import_batch(batch_id UUID)` - Processes substance imports

## Row Level Security (RLS)

All new tables have RLS enabled with appropriate policies:
- Public tables (substances, interactions, supplements): Public read access
- User data (health_metrics, experiments, protocols): Users can only access their own data
- Staging tables: Service role only

## Indexes

Performance indexes are created for:
- Parent-child relationships (supplements.parent_id)
- Search queries (supplements.name_en, name_sv)
- Time-series queries (health_metrics.recorded_at, user_id, type)
- Graph queries (interactions.substance_a_id, substance_b_id, severity)
- Protocol forking (protocols.forked_from_id)
- User activity tracking (profiles.xp_total, username)

## Triggers

**Automatic updates:**
- XP and streak updates when activities are completed
- Protocol fork_count and like_count updates
- updated_at timestamp updates on all relevant tables

## Notes

1. **Partitioning**: Health metrics partitioning is set up for current and next month. For production, consider using `pg_partman` extension for automatic partition management.

2. **CSV Import**: The parent-child detection logic needs to be implemented in the application layer before inserting data into staging tables. The staging tables and processing functions are ready to use.

3. **Substance Import**: The `process_substance_import_batch` function is a placeholder - implement the actual CSV parsing logic based on your CSV structure.

4. **Search Function**: The `search_supplements` function returns variants as a JSONB array. Frontend should handle parsing this structure.

## Migration from Existing Schema

If you already have data in your database:

1. **Supplements**: Existing supplements will have `parent_id = NULL` and `is_parent = FALSE` by default. You'll need to manually establish parent-child relationships or use the CSV import process.

2. **Profiles**: Existing profiles will have default values:
   - `xp_total = 0`
   - `current_streak = 0`
   - `subscription_tier = 'free'`
   - `username = NULL` (can be set later)

3. **Health Metrics**: New table, no migration needed.

4. **All other tables**: New tables, no migration needed.

## Testing

After running the extensions, you can test key functions:

```sql
-- Test hierarchical search
SELECT * FROM search_supplements('Magnesium');

-- Test XP trigger (should award XP and update last_active_at)
INSERT INTO daily_checkins (user_id, sleep_score) 
VALUES ('your-user-id', 85);

-- Check XP was awarded
SELECT username, xp_total, current_streak, last_active_at 
FROM profiles 
WHERE id = 'your-user-id';
```

## Support

For issues or questions about the schema extensions, refer to the technical plan document or contact the development team.
