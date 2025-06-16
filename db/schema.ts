import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const coins = sqliteTable('coins', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	amount: integer('amount').notNull().default(0),
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
