CREATE TABLE `achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`win_streak_3` integer DEFAULT 0,
	`win_streak_5` integer DEFAULT 0,
	`win_streak_10` integer DEFAULT 0,
	`total_play_time` integer DEFAULT 0,
	`playtime_30_min` integer DEFAULT 0,
	`playtime_1_hour` integer DEFAULT 0,
	`playtime_5_hours` integer DEFAULT 0,
	`daily_streak_3` integer DEFAULT 0,
	`daily_streak_7` integer DEFAULT 0,
	`daily_streak_30` integer DEFAULT 0,
	`first_win` integer DEFAULT 0,
	`win_10_games` integer DEFAULT 0,
	`win_50_games` integer DEFAULT 0,
	`win_100_games` integer DEFAULT 0,
	`perfect_week` integer DEFAULT 0,
	`speedster` integer DEFAULT 0,
	`comeback` integer DEFAULT 0,
	`games_played_100` integer DEFAULT 0,
	`games_played_500` integer DEFAULT 0,
	`games_played_1000` integer DEFAULT 0,
	`last_updated` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `daily_activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`games_played` integer DEFAULT 0,
	`time_spent` integer DEFAULT 0,
	`last_activity` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`start_time` text DEFAULT CURRENT_TIMESTAMP,
	`end_time` text,
	`duration` integer DEFAULT 0,
	`games_played` integer DEFAULT 0
);
