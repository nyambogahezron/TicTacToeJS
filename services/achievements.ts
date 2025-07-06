import { sql } from 'drizzle-orm';
import { achievements, dailyActivity, sessions } from '../db/schema';
import { db } from '../db/connection';

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	coinReward: number;
	unlocked: boolean;
	progress: number;
	maxProgress: number;
	category: 'wins' | 'streaks' | 'time' | 'daily' | 'milestones';
}

let sessionStartTime: Date | null = null;
let currentSessionId: number | null = null;

// Initialize session when app starts
export const startSession = async (): Promise<void> => {
	try {
		sessionStartTime = new Date();
		const result = await db
			.insert(sessions)
			.values({
				startTime: sessionStartTime.toISOString(),
			})
			.returning({ id: sessions.id });

		currentSessionId = result[0]?.id || null;

		// Record daily activity
		await recordDailyActivity();
	} catch (error) {
		console.error('Error starting session:', error);
	}
};

// End session when app closes or goes to background
export const endSession = async (): Promise<void> => {
	try {
		if (!sessionStartTime || !currentSessionId) return;

		const endTime = new Date();
		const duration = Math.floor(
			(endTime.getTime() - sessionStartTime.getTime()) / (1000 * 60)
		); // minutes

		await db
			.update(sessions)
			.set({
				endTime: endTime.toISOString(),
				duration,
			})
			.where(sql`id = ${currentSessionId}`);

		// Update total playtime
		await updateTotalPlaytime(duration);

		sessionStartTime = null;
		currentSessionId = null;
	} catch (error) {
		console.error('Error ending session:', error);
	}
};

// Record daily activity
const recordDailyActivity = async (): Promise<void> => {
	try {
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

		const existingActivity = await db
			.select()
			.from(dailyActivity)
			.where(sql`date = ${today}`)
			.limit(1);

		if (existingActivity.length === 0) {
			await db.insert(dailyActivity).values({
				date: today,
				gamesPlayed: 0,
				timeSpent: 0,
			});
		}
	} catch (error) {
		console.error('Error recording daily activity:', error);
	}
};

// Update daily activity
export const updateDailyActivity = async (
	gamesPlayed: number = 0
): Promise<void> => {
	try {
		const today = new Date().toISOString().split('T')[0];
		const duration = sessionStartTime
			? Math.floor(
					(new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60)
			  )
			: 0;

		const existingActivity = await db
			.select()
			.from(dailyActivity)
			.where(sql`date = ${today}`)
			.limit(1);

		if (existingActivity.length > 0) {
			await db
				.update(dailyActivity)
				.set({
					gamesPlayed: (existingActivity[0]?.gamesPlayed || 0) + gamesPlayed,
					timeSpent: Math.max(existingActivity[0]?.timeSpent || 0, duration),
					lastActivity: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`date = ${today}`);
		}
	} catch (error) {
		console.error('Error updating daily activity:', error);
	}
};

// Get or create achievements record
const getAchievementsRecord = async () => {
	try {
		let result = await db.select().from(achievements).limit(1);

		if (result.length === 0) {
			await db.insert(achievements).values({});
			result = await db.select().from(achievements).limit(1);
		}

		return result[0];
	} catch (error) {
		console.error('Error getting achievements record:', error);
		return null;
	}
};

// Update total playtime
const updateTotalPlaytime = async (
	additionalMinutes: number
): Promise<void> => {
	try {
		const record = await getAchievementsRecord();
		if (!record) return;

		const newPlaytime = (record.totalPlayTime || 0) + additionalMinutes;

		await db
			.update(achievements)
			.set({
				totalPlayTime: newPlaytime,
				lastUpdated: sql`CURRENT_TIMESTAMP`,
			})
			.where(sql`id = ${record.id}`);

		// Check time-based achievements
		await checkTimeAchievements(newPlaytime);
	} catch (error) {
		console.error('Error updating total playtime:', error);
	}
};

// Check and update win streak achievements
export const checkWinStreakAchievements = async (
	consecutiveWins: number
): Promise<Achievement[]> => {
	const newAchievements: Achievement[] = [];

	try {
		const record = await getAchievementsRecord();
		if (!record) return newAchievements;

		const updates: any = {};

		// 3 wins in a row
		if (consecutiveWins >= 3 && !record.winStreak3) {
			updates.winStreak3 = 1;
			newAchievements.push({
				id: 'winStreak3',
				title: 'Hat Trick',
				description: 'Win 3 games in a row',
				icon: '🎯',
				coinReward: 10,
				unlocked: true,
				progress: 3,
				maxProgress: 3,
				category: 'streaks',
			});
		}

		// 5 wins in a row
		if (consecutiveWins >= 5 && !record.winStreak5) {
			updates.winStreak5 = 1;
			newAchievements.push({
				id: 'winStreak5',
				title: 'Dominator',
				description: 'Win 5 games in a row',
				icon: '🔥',
				coinReward: 25,
				unlocked: true,
				progress: 5,
				maxProgress: 5,
				category: 'streaks',
			});
		}

		// 10 wins in a row
		if (consecutiveWins >= 10 && !record.winStreak10) {
			updates.winStreak10 = 1;
			newAchievements.push({
				id: 'winStreak10',
				title: 'Unstoppable',
				description: 'Win 10 games in a row',
				icon: '👑',
				coinReward: 50,
				unlocked: true,
				progress: 10,
				maxProgress: 10,
				category: 'streaks',
			});
		}

		// Update database if there are new achievements
		if (Object.keys(updates).length > 0) {
			await db
				.update(achievements)
				.set({
					...updates,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${record.id}`);
		}
	} catch (error) {
		console.error('Error checking win streak achievements:', error);
	}

	return newAchievements;
};

// Check time-based achievements
const checkTimeAchievements = async (
	totalMinutes: number
): Promise<Achievement[]> => {
	const newAchievements: Achievement[] = [];

	try {
		const record = await getAchievementsRecord();
		if (!record) return newAchievements;

		const updates: any = {};

		// 30 minutes
		if (totalMinutes >= 30 && !record.playtime30Min) {
			updates.playtime30Min = 1;
			newAchievements.push({
				id: 'playtime30Min',
				title: 'Getting Started',
				description: 'Play for 30 minutes total',
				icon: '⏰',
				coinReward: 15,
				unlocked: true,
				progress: 30,
				maxProgress: 30,
				category: 'time',
			});
		}

		// 1 hour
		if (totalMinutes >= 60 && !record.playtime1Hour) {
			updates.playtime1Hour = 1;
			newAchievements.push({
				id: 'playtime1Hour',
				title: 'Dedicated Player',
				description: 'Play for 1 hour total',
				icon: '🕐',
				coinReward: 30,
				unlocked: true,
				progress: 60,
				maxProgress: 60,
				category: 'time',
			});
		}

		// 5 hours
		if (totalMinutes >= 300 && !record.playtime5Hours) {
			updates.playtime5Hours = 1;
			newAchievements.push({
				id: 'playtime5Hours',
				title: 'Time Master',
				description: 'Play for 5 hours total',
				icon: '⏳',
				coinReward: 100,
				unlocked: true,
				progress: 300,
				maxProgress: 300,
				category: 'time',
			});
		}

		// Update database if there are new achievements
		if (Object.keys(updates).length > 0) {
			await db
				.update(achievements)
				.set({
					...updates,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${record.id}`);
		}
	} catch (error) {
		console.error('Error checking time achievements:', error);
	}

	return newAchievements;
};

// Check daily streak achievements
export const checkDailyStreakAchievements = async (): Promise<
	Achievement[]
> => {
	const newAchievements: Achievement[] = [];

	try {
		const record = await getAchievementsRecord();
		if (!record) return newAchievements;

		// Get consecutive days
		const consecutiveDays = await getConsecutiveDays();
		const updates: any = {};

		// 3 days in a row
		if (consecutiveDays >= 3 && !record.dailyStreak3) {
			updates.dailyStreak3 = 1;
			newAchievements.push({
				id: 'dailyStreak3',
				title: 'Daily Habit',
				description: 'Play 3 days in a row',
				icon: '📅',
				coinReward: 20,
				unlocked: true,
				progress: 3,
				maxProgress: 3,
				category: 'daily',
			});
		}

		// 7 days in a row
		if (consecutiveDays >= 7 && !record.dailyStreak7) {
			updates.dailyStreak7 = 1;
			newAchievements.push({
				id: 'dailyStreak7',
				title: 'Weekly Warrior',
				description: 'Play 7 days in a row',
				icon: '🗓️',
				coinReward: 50,
				unlocked: true,
				progress: 7,
				maxProgress: 7,
				category: 'daily',
			});
		}

		// 30 days in a row
		if (consecutiveDays >= 30 && !record.dailyStreak30) {
			updates.dailyStreak30 = 1;
			newAchievements.push({
				id: 'dailyStreak30',
				title: 'Monthly Master',
				description: 'Play 30 days in a row',
				icon: '🏆',
				coinReward: 200,
				unlocked: true,
				progress: 30,
				maxProgress: 30,
				category: 'daily',
			});
		}

		// Update database if there are new achievements
		if (Object.keys(updates).length > 0) {
			await db
				.update(achievements)
				.set({
					...updates,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${record.id}`);
		}
	} catch (error) {
		console.error('Error checking daily streak achievements:', error);
	}

	return newAchievements;
};

// Get consecutive days played
const getConsecutiveDays = async (): Promise<number> => {
	try {
		const activities = await db
			.select()
			.from(dailyActivity)
			.orderBy(sql`date DESC`)
			.limit(60); // Check last 60 days

		if (activities.length === 0) return 0;

		let consecutiveDays = 0;
		const today = new Date();

		for (let i = 0; i < activities.length; i++) {
			const activityDate = new Date(activities[i].date);
			const expectedDate = new Date(today);
			expectedDate.setDate(today.getDate() - i);

			const activityDateStr = activityDate.toISOString().split('T')[0];
			const expectedDateStr = expectedDate.toISOString().split('T')[0];

			if (activityDateStr === expectedDateStr) {
				consecutiveDays++;
			} else {
				break;
			}
		}

		return consecutiveDays;
	} catch (error) {
		console.error('Error getting consecutive days:', error);
		return 0;
	}
};

// Check win-based achievements
export const checkWinAchievements = async (
	totalWins: number
): Promise<Achievement[]> => {
	const newAchievements: Achievement[] = [];

	try {
		const record = await getAchievementsRecord();
		if (!record) return newAchievements;

		const updates: any = {};

		// First win
		if (totalWins >= 1 && !record.firstWin) {
			updates.firstWin = 1;
			newAchievements.push({
				id: 'firstWin',
				title: 'First Victory',
				description: 'Win your first game',
				icon: '🎉',
				coinReward: 5,
				unlocked: true,
				progress: 1,
				maxProgress: 1,
				category: 'wins',
			});
		}

		// 10 wins
		if (totalWins >= 10 && !record.win10Games) {
			updates.win10Games = 1;
			newAchievements.push({
				id: 'win10Games',
				title: 'Rising Star',
				description: 'Win 10 games',
				icon: '⭐',
				coinReward: 25,
				unlocked: true,
				progress: 10,
				maxProgress: 10,
				category: 'wins',
			});
		}

		// 50 wins
		if (totalWins >= 50 && !record.win50Games) {
			updates.win50Games = 1;
			newAchievements.push({
				id: 'win50Games',
				title: 'Veteran Player',
				description: 'Win 50 games',
				icon: '🎖️',
				coinReward: 75,
				unlocked: true,
				progress: 50,
				maxProgress: 50,
				category: 'wins',
			});
		}

		// 100 wins
		if (totalWins >= 100 && !record.win100Games) {
			updates.win100Games = 1;
			newAchievements.push({
				id: 'win100Games',
				title: 'Champion',
				description: 'Win 100 games',
				icon: '🏆',
				coinReward: 200,
				unlocked: true,
				progress: 100,
				maxProgress: 100,
				category: 'wins',
			});
		}

		// Update database if there are new achievements
		if (Object.keys(updates).length > 0) {
			await db
				.update(achievements)
				.set({
					...updates,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${record.id}`);
		}
	} catch (error) {
		console.error('Error checking win achievements:', error);
	}

	return newAchievements;
};

// Check milestone achievements
export const checkMilestoneAchievements = async (
	totalGames: number
): Promise<Achievement[]> => {
	const newAchievements: Achievement[] = [];

	try {
		const record = await getAchievementsRecord();
		if (!record) return newAchievements;

		const updates: any = {};

		// 100 games played
		if (totalGames >= 100 && !record.gamesPlayed100) {
			updates.gamesPlayed100 = 1;
			newAchievements.push({
				id: 'gamesPlayed100',
				title: 'Century Club',
				description: 'Play 100 games',
				icon: '💯',
				coinReward: 50,
				unlocked: true,
				progress: 100,
				maxProgress: 100,
				category: 'milestones',
			});
		}

		// 500 games played
		if (totalGames >= 500 && !record.gamesPlayed500) {
			updates.gamesPlayed500 = 1;
			newAchievements.push({
				id: 'gamesPlayed500',
				title: 'Hardcore Gamer',
				description: 'Play 500 games',
				icon: '🎮',
				coinReward: 150,
				unlocked: true,
				progress: 500,
				maxProgress: 500,
				category: 'milestones',
			});
		}

		// 1000 games played
		if (totalGames >= 1000 && !record.gamesPlayed1000) {
			updates.gamesPlayed1000 = 1;
			newAchievements.push({
				id: 'gamesPlayed1000',
				title: 'Legend',
				description: 'Play 1000 games',
				icon: '🌟',
				coinReward: 500,
				unlocked: true,
				progress: 1000,
				maxProgress: 1000,
				category: 'milestones',
			});
		}

		// Update database if there are new achievements
		if (Object.keys(updates).length > 0) {
			await db
				.update(achievements)
				.set({
					...updates,
					lastUpdated: sql`CURRENT_TIMESTAMP`,
				})
				.where(sql`id = ${record.id}`);
		}
	} catch (error) {
		console.error('Error checking milestone achievements:', error);
	}

	return newAchievements;
};

// Get all achievements with current progress
export const getAllAchievements = async (currentStats: {
	totalWins: number;
	totalGames: number;
	consecutiveWins: number;
}): Promise<Achievement[]> => {
	try {
		const record = await getAchievementsRecord();
		const consecutiveDays = await getConsecutiveDays();

		if (!record) return [];

		const achievements: Achievement[] = [
			// Win streak achievements
			{
				id: 'winStreak3',
				title: 'Hat Trick',
				description: 'Win 3 games in a row',
				icon: '🎯',
				coinReward: 10,
				unlocked: !!record.winStreak3,
				progress: Math.min(currentStats.consecutiveWins, 3),
				maxProgress: 3,
				category: 'streaks',
			},
			{
				id: 'winStreak5',
				title: 'Dominator',
				description: 'Win 5 games in a row',
				icon: '🔥',
				coinReward: 25,
				unlocked: !!record.winStreak5,
				progress: Math.min(currentStats.consecutiveWins, 5),
				maxProgress: 5,
				category: 'streaks',
			},
			{
				id: 'winStreak10',
				title: 'Unstoppable',
				description: 'Win 10 games in a row',
				icon: '👑',
				coinReward: 50,
				unlocked: !!record.winStreak10,
				progress: Math.min(currentStats.consecutiveWins, 10),
				maxProgress: 10,
				category: 'streaks',
			},

			// Time-based achievements
			{
				id: 'playtime30Min',
				title: 'Getting Started',
				description: 'Play for 30 minutes total',
				icon: '⏰',
				coinReward: 15,
				unlocked: !!record.playtime30Min,
				progress: Math.min(record.totalPlayTime || 0, 30),
				maxProgress: 30,
				category: 'time',
			},
			{
				id: 'playtime1Hour',
				title: 'Dedicated Player',
				description: 'Play for 1 hour total',
				icon: '🕐',
				coinReward: 30,
				unlocked: !!record.playtime1Hour,
				progress: Math.min(record.totalPlayTime || 0, 60),
				maxProgress: 60,
				category: 'time',
			},
			{
				id: 'playtime5Hours',
				title: 'Time Master',
				description: 'Play for 5 hours total',
				icon: '⏳',
				coinReward: 100,
				unlocked: !!record.playtime5Hours,
				progress: Math.min(record.totalPlayTime || 0, 300),
				maxProgress: 300,
				category: 'time',
			},

			// Daily streak achievements
			{
				id: 'dailyStreak3',
				title: 'Daily Habit',
				description: 'Play 3 days in a row',
				icon: '📅',
				coinReward: 20,
				unlocked: !!record.dailyStreak3,
				progress: Math.min(consecutiveDays, 3),
				maxProgress: 3,
				category: 'daily',
			},
			{
				id: 'dailyStreak7',
				title: 'Weekly Warrior',
				description: 'Play 7 days in a row',
				icon: '🗓️',
				coinReward: 50,
				unlocked: !!record.dailyStreak7,
				progress: Math.min(consecutiveDays, 7),
				maxProgress: 7,
				category: 'daily',
			},
			{
				id: 'dailyStreak30',
				title: 'Monthly Master',
				description: 'Play 30 days in a row',
				icon: '🏆',
				coinReward: 200,
				unlocked: !!record.dailyStreak30,
				progress: Math.min(consecutiveDays, 30),
				maxProgress: 30,
				category: 'daily',
			},

			// Win-based achievements
			{
				id: 'firstWin',
				title: 'First Victory',
				description: 'Win your first game',
				icon: '🎉',
				coinReward: 5,
				unlocked: !!record.firstWin,
				progress: Math.min(currentStats.totalWins, 1),
				maxProgress: 1,
				category: 'wins',
			},
			{
				id: 'win10Games',
				title: 'Rising Star',
				description: 'Win 10 games',
				icon: '⭐',
				coinReward: 25,
				unlocked: !!record.win10Games,
				progress: Math.min(currentStats.totalWins, 10),
				maxProgress: 10,
				category: 'wins',
			},
			{
				id: 'win50Games',
				title: 'Veteran Player',
				description: 'Win 50 games',
				icon: '🎖️',
				coinReward: 75,
				unlocked: !!record.win50Games,
				progress: Math.min(currentStats.totalWins, 50),
				maxProgress: 50,
				category: 'wins',
			},
			{
				id: 'win100Games',
				title: 'Champion',
				description: 'Win 100 games',
				icon: '🏆',
				coinReward: 200,
				unlocked: !!record.win100Games,
				progress: Math.min(currentStats.totalWins, 100),
				maxProgress: 100,
				category: 'wins',
			},

			// Milestone achievements
			{
				id: 'gamesPlayed100',
				title: 'Century Club',
				description: 'Play 100 games',
				icon: '💯',
				coinReward: 50,
				unlocked: !!record.gamesPlayed100,
				progress: Math.min(currentStats.totalGames, 100),
				maxProgress: 100,
				category: 'milestones',
			},
			{
				id: 'gamesPlayed500',
				title: 'Hardcore Gamer',
				description: 'Play 500 games',
				icon: '🎮',
				coinReward: 150,
				unlocked: !!record.gamesPlayed500,
				progress: Math.min(currentStats.totalGames, 500),
				maxProgress: 500,
				category: 'milestones',
			},
			{
				id: 'gamesPlayed1000',
				title: 'Legend',
				description: 'Play 1000 games',
				icon: '🌟',
				coinReward: 500,
				unlocked: !!record.gamesPlayed1000,
				progress: Math.min(currentStats.totalGames, 1000),
				maxProgress: 1000,
				category: 'milestones',
			},
		];

		return achievements;
	} catch (error) {
		console.error('Error getting all achievements:', error);
		return [];
	}
};

// Check all achievements and return newly unlocked ones
export const checkAllAchievements = async (gameStats: {
	totalWins: number;
	totalGames: number;
	consecutiveWins: number;
}): Promise<Achievement[]> => {
	const newAchievements: Achievement[] = [];

	try {
		// Check different types of achievements
		const [
			winStreakAchievements,
			winAchievements,
			milestoneAchievements,
			dailyAchievements,
		] = await Promise.all([
			checkWinStreakAchievements(gameStats.consecutiveWins),
			checkWinAchievements(gameStats.totalWins),
			checkMilestoneAchievements(gameStats.totalGames),
			checkDailyStreakAchievements(),
		]);

		newAchievements.push(
			...winStreakAchievements,
			...winAchievements,
			...milestoneAchievements,
			...dailyAchievements
		);
	} catch (error) {
		console.error('Error checking all achievements:', error);
	}

	return newAchievements;
};

// Get total coin rewards from achievements
export const getTotalAchievementCoins = async (): Promise<number> => {
	try {
		const record = await getAchievementsRecord();
		if (!record) return 0;

		let totalCoins = 0;

		// Calculate coins from all unlocked achievements
		if (record.winStreak3) totalCoins += 10;
		if (record.winStreak5) totalCoins += 25;
		if (record.winStreak10) totalCoins += 50;
		if (record.playtime30Min) totalCoins += 15;
		if (record.playtime1Hour) totalCoins += 30;
		if (record.playtime5Hours) totalCoins += 100;
		if (record.dailyStreak3) totalCoins += 20;
		if (record.dailyStreak7) totalCoins += 50;
		if (record.dailyStreak30) totalCoins += 200;
		if (record.firstWin) totalCoins += 5;
		if (record.win10Games) totalCoins += 25;
		if (record.win50Games) totalCoins += 75;
		if (record.win100Games) totalCoins += 200;
		if (record.gamesPlayed100) totalCoins += 50;
		if (record.gamesPlayed500) totalCoins += 150;
		if (record.gamesPlayed1000) totalCoins += 500;

		return totalCoins;
	} catch (error) {
		console.error('Error getting total achievement coins:', error);
		return 0;
	}
};
