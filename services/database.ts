import { sql } from 'drizzle-orm';
import { coins, stats } from '../db/schema';
import { db } from '../db/connection';
import {
	checkAllAchievements,
	startSession,
	endSession,
	updateDailyActivity,
} from './achievements';

// Cache for frequently accessed data
let coinCache: {
	amount: number;
	timestamp: number;
	welcomeBonus: boolean;
} | null = null;
let statsCache: {
	gamesPlayed: number;
	gamesWon: number;
	highestScore: number;
	totalScore: number;
	timestamp: number;
} | null = null;

const CACHE_DURATION = 5000; // 5 seconds cache

// Coins operations
export const getCoins = async (): Promise<number> => {
	try {
		// Check cache first
		if (coinCache && Date.now() - coinCache.timestamp < CACHE_DURATION) {
			return coinCache.amount;
		}

		// Get the breakdown and calculate total
		const breakdown = await getCoinBreakdown();
		const amount = breakdown.total;

		// Update cache
		coinCache = {
			amount,
			timestamp: Date.now(),
			welcomeBonus: false, // Will be updated by getWelcomeBonusStatus if needed
		};

		return amount;
	} catch (error) {
		console.error('Error getting coins:', error);
		throw error;
	}
};

export const getWelcomeBonusStatus = async (): Promise<boolean> => {
	try {
		// Check cache first
		if (coinCache && Date.now() - coinCache.timestamp < CACHE_DURATION) {
			return coinCache.welcomeBonus;
		}

		const result = await db.select().from(coins).orderBy(coins.id).limit(1);
		const welcomeBonus = result[0]?.welcomeBonusGiven === 1;

		// Update cache
		coinCache = {
			amount: result[0]?.amount ?? 0,
			timestamp: Date.now(),
			welcomeBonus,
		};

		return welcomeBonus;
	} catch (error) {
		console.error('Error getting welcome bonus status:', error);
		return false;
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

		// Invalidate cache
		coinCache = null;
	} catch (error) {
		console.error('Error setting welcome bonus status:', error);
		throw error;
	}
};

// Add coins with proper tracking (achievement vs game coins)
export const addAchievementCoins = async (amount: number): Promise<void> => {
	try {
		const currentRecord = await db
			.select()
			.from(coins)
			.orderBy(coins.id)
			.limit(1);

		if (currentRecord.length > 0) {
			const current = currentRecord[0];
			const newAchievementCoins = (current.achievementCoins || 0) + amount;

			await db
				.update(coins)
				.set({
					achievementCoins: newAchievementCoins,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${current.id}`);
		} else {
			await db.insert(coins).values({
				achievementCoins: amount,
				gameCoins: 0,
			});
		}

		// Invalidate cache
		coinCache = null;
	} catch (error) {
		console.error('Error adding achievement coins:', error);
		throw error;
	}
};

// Add game coins (from gameplay)
export const addGameCoins = async (amount: number): Promise<void> => {
	try {
		const currentRecord = await db
			.select()
			.from(coins)
			.orderBy(coins.id)
			.limit(1);

		if (currentRecord.length > 0) {
			const current = currentRecord[0];
			const newGameCoins = (current.gameCoins || 0) + amount;

			await db
				.update(coins)
				.set({
					gameCoins: newGameCoins,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${current.id}`);
		} else {
			await db.insert(coins).values({
				achievementCoins: 0,
				gameCoins: amount,
			});
		}

		// Invalidate cache
		coinCache = null;
	} catch (error) {
		console.error('Error adding game coins:', error);
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
		// Check cache first
		if (statsCache && Date.now() - statsCache.timestamp < CACHE_DURATION) {
			return {
				gamesPlayed: statsCache.gamesPlayed,
				gamesWon: statsCache.gamesWon,
				highestScore: statsCache.highestScore,
				totalScore: statsCache.totalScore,
			};
		}

		const result = await db.select().from(stats).orderBy(stats.id).limit(1);
		const statsData = {
			gamesPlayed: result[0]?.gamesPlayed ?? 0,
			gamesWon: result[0]?.gamesWon ?? 0,
			highestScore: result[0]?.highestScore ?? 0,
			totalScore: result[0]?.totalScore ?? 0,
		};

		// Update cache
		statsCache = {
			...statsData,
			timestamp: Date.now(),
		};

		return statsData;
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

		// Invalidate cache
		statsCache = null;
	} catch (error) {
		console.error('Error updating stats:', error);
		throw error;
	}
};

// Enhanced function to handle game completion with achievements
export const completeGame = async (
	gameResult: 'win' | 'loss' | 'draw',
	consecutiveWins: number,
	totalWins: number,
	totalGames: number,
	notificationCallback?: (achievements: any[]) => void
): Promise<any[]> => {
	try {
		// Update daily activity
		await updateDailyActivity(1);

		// Check for new achievements
		const newAchievements = await checkAllAchievements({
			totalWins,
			totalGames,
			consecutiveWins,
		});

		// Award coins for new achievements
		if (newAchievements.length > 0) {
			const achievementCoins = newAchievements.reduce(
				(total, achievement) => total + achievement.coinReward,
				0
			);

			await addAchievementCoins(achievementCoins);

			// Show achievement popups
			if (newAchievements.length > 0) {
				// Use global achievement notification system
				const globalRefresh = (global as any).refreshAchievements;
				if (globalRefresh) {
					globalRefresh();
				}

				// Show first achievement popup (if you want to show them one by one)
				const globalAddAchievement = (global as any).addNewAchievement;
				if (globalAddAchievement && newAchievements[0]) {
					globalAddAchievement(newAchievements[0]);
				}
			}
		}

		return newAchievements;
	} catch (error) {
		console.error('Error completing game:', error);
		return [];
	}
};

// Session management functions
export const initializeSession = async (): Promise<void> => {
	try {
		await startSession();
	} catch (error) {
		console.error('Error initializing session:', error);
	}
};

export const finalizeSession = async (): Promise<void> => {
	try {
		await endSession();
	} catch (error) {
		console.error('Error finalizing session:', error);
	}
};

// Get detailed coin breakdown
export const getCoinBreakdown = async (): Promise<{
	total: number;
	gameCoins: number;
	achievementCoins: number;
}> => {
	try {
		const result = await db.select().from(coins).orderBy(coins.id).limit(1);

		if (result.length === 0) {
			return { total: 0, gameCoins: 0, achievementCoins: 0 };
		}

		const record = result[0];
		const gameCoins = record.gameCoins || 0;
		const achievementCoins = record.achievementCoins || 0;
		const total = gameCoins + achievementCoins;

		return {
			total,
			gameCoins,
			achievementCoins,
		};
	} catch (error) {
		console.error('Error getting coin breakdown:', error);
		return { total: 0, gameCoins: 0, achievementCoins: 0 };
	}
};
