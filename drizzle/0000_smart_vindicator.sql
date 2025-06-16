CREATE TABLE `coins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`last_updated` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`games_played` integer DEFAULT 0,
	`games_won` integer DEFAULT 0,
	`highest_score` integer DEFAULT 0,
	`total_score` integer DEFAULT 0,
	`last_updated` text DEFAULT CURRENT_TIMESTAMP
);
