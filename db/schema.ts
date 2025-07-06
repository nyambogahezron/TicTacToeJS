import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const coins = sqliteTable('coins', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	amount: integer('amount').notNull().default(0),
	welcomeBonusGiven: integer('welcome_bonus_given').notNull().default(0),
	lastUpdated: text('last_updated').default(sql`CURRENT_TIMESTAMP`),
});

export const stats = sqliteTable('stats', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	gamesPlayed: integer('games_played').default(0),
	gamesWon: integer('games_won').default(0),
	highestScore: integer('highest_score').default(0),
	totalScore: integer('total_score').default(0),
	lastUpdated: text('last_updated').default(sql`CURRENT_TIMESTAMP`),
});

// New achievements table
export const achievements = sqliteTable('achievements', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	// Win streak achievements
	winStreak3: integer('win_streak_3').default(0),
	winStreak5: integer('win_streak_5').default(0),
	winStreak10: integer('win_streak_10').default(0),
	// Time-based achievements
	totalPlayTime: integer('total_play_time').default(0), // in minutes
	playtime30Min: integer('playtime_30_min').default(0),
	playtime1Hour: integer('playtime_1_hour').default(0),
	playtime5Hours: integer('playtime_5_hours').default(0),
	// Daily streak achievements
	dailyStreak3: integer('daily_streak_3').default(0),
	dailyStreak7: integer('daily_streak_7').default(0),
	dailyStreak30: integer('daily_streak_30').default(0),
	// Game record achievements
	firstWin: integer('first_win').default(0),
	win10Games: integer('win_10_games').default(0),
	win50Games: integer('win_50_games').default(0),
	win100Games: integer('win_100_games').default(0),
	// Perfect game achievements
	perfectWeek: integer('perfect_week').default(0), // 7 wins in a row without losses
	speedster: integer('speedster').default(0), // Win in under 30 seconds
	comeback: integer('comeback').default(0), // Win after being behind
	// Milestone achievements
	gamesPlayed100: integer('games_played_100').default(0),
	gamesPlayed500: integer('games_played_500').default(0),
	gamesPlayed1000: integer('games_played_1000').default(0),
	lastUpdated: text('last_updated').default(sql`CURRENT_TIMESTAMP`),
});

// Daily activity tracking
export const dailyActivity = sqliteTable('daily_activity', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	date: text('date').notNull(), // YYYY-MM-DD format
	gamesPlayed: integer('games_played').default(0),
	timeSpent: integer('time_spent').default(0), // in minutes
	lastActivity: text('last_activity').default(sql`CURRENT_TIMESTAMP`),
});

// Session tracking for time-based achievements
export const sessions = sqliteTable('sessions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	startTime: text('start_time').default(sql`CURRENT_TIMESTAMP`),
	endTime: text('end_time'),
	duration: integer('duration').default(0), // in minutes
	gamesPlayed: integer('games_played').default(0),
});
