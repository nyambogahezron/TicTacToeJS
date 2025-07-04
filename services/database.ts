import { sql } from 'drizzle-orm';
import { coins, stats } from '../db/schema';
import { db } from '../db/connection';

// Coins operations
export const getCoins = async (): Promise<number> => {
	try {
		const result = await db.select().from(coins).orderBy(coins.id).limit(1);
		return result[0]?.amount ?? 0;
	} catch (error) {
		console.error('Error getting coins:', error);
		throw error;
	}
};

export const getWelcomeBonusStatus = async (): Promise<boolean> => {
	try {
		const result = await db.select().from(coins).orderBy(coins.id).limit(1);
		return result[0]?.welcomeBonusGiven === 1;
	} catch (error) {
		console.error('Error getting welcome bonus status:', error);
		return false;
	}
};

export const updateCoins = async (amount: number): Promise<void> => {
	try {
		const currentCoin = await db
			.select()
			.from(coins)
			.orderBy(coins.id)
			.limit(1);

		if (currentCoin.length > 0) {
			await db
				.update(coins)
				.set({
					amount,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${currentCoin[0].id}`);
		} else {
			await db.insert(coins).values({ amount });
		}
	} catch (error) {
		console.error('Error updating coins:', error);
		throw error;
	}
};

export const setWelcomeBonusGiven = async (): Promise<void> => {
	try {
		const currentCoin = await db
			.select()
			.from(coins)
			.orderBy(coins.id)
			.limit(1);

		if (currentCoin.length > 0) {
			await db
				.update(coins)
				.set({
					welcomeBonusGiven: 1,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${currentCoin[0].id}`);
		} else {
			await db.insert(coins).values({ amount: 0, welcomeBonusGiven: 1 });
		}
	} catch (error) {
		console.error('Error setting welcome bonus status:', error);
		throw error;
	}
};

export const addCoins = async (amount: number): Promise<void> => {
	try {
		const currentCoins = await getCoins();
		await updateCoins(currentCoins + amount);
	} catch (error) {
		console.error('Error adding coins:', error);
		throw error;
	}
};

// Stats operations
export const getStats = async (): Promise<{
	gamesPlayed: number;
	gamesWon: number;
	highestScore: number;
	totalScore: number;
}> => {
	try {
		const result = await db.select().from(stats).orderBy(stats.id).limit(1);

		return {
			gamesPlayed: result[0]?.gamesPlayed ?? 0,
			gamesWon: result[0]?.gamesWon ?? 0,
			highestScore: result[0]?.highestScore ?? 0,
			totalScore: result[0]?.totalScore ?? 0,
		};
	} catch (error) {
		console.error('Error getting stats:', error);
		throw error;
	}
};

export const updateStats = async (newStats: {
	gamesPlayed?: number;
	gamesWon?: number;
	highestScore?: number;
	totalScore?: number;
}): Promise<void> => {
	try {
		const currentStats = await db
			.select()
			.from(stats)
			.orderBy(stats.id)
			.limit(1);

		if (currentStats.length > 0) {
			await db
				.update(stats)
				.set({
					gamesPlayed: newStats.gamesPlayed ?? currentStats[0].gamesPlayed,
					gamesWon: newStats.gamesWon ?? currentStats[0].gamesWon,
					highestScore: newStats.highestScore ?? currentStats[0].highestScore,
					totalScore: newStats.totalScore ?? currentStats[0].totalScore,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${currentStats[0].id}`);
		} else {
			await db.insert(stats).values({
				gamesPlayed: newStats.gamesPlayed ?? 0,
				gamesWon: newStats.gamesWon ?? 0,
				highestScore: newStats.highestScore ?? 0,
				totalScore: newStats.totalScore ?? 0,
			});
		}
	} catch (error) {
		console.error('Error updating stats:', error);
		throw error;
	}
};
