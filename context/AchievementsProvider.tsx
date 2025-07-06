import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	ReactNode,
} from 'react';
import { getAllAchievements, Achievement } from '@/services/achievements';
import { initializeSession, finalizeSession } from '@/services/database';
import { AppState } from 'react-native';

interface AchievementsContextType {
	achievements: Achievement[];
	unlockedAchievements: Achievement[];
	showAchievementPopup: boolean;
	newAchievement: Achievement | null;
	refreshAchievements: (stats?: {
		totalWins: number;
		totalGames: number;
		consecutiveWins: number;
	}) => Promise<void>;
	dismissAchievementPopup: () => void;
	addNewAchievement: (achievement: Achievement) => void;
	getAchievementsByCategory: (category: string) => Achievement[];
	getUnlockedCount: () => number;
	getTotalCount: () => number;
}

const AchievementsContext = createContext<AchievementsContextType | null>(null);

export function AchievementsProvider({ children }: { children: ReactNode }) {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [unlockedAchievements, setUnlockedAchievements] = useState<
		Achievement[]
	>([]);
	const [showAchievementPopup, setShowAchievementPopup] = useState(false);
	const [newAchievement, setNewAchievement] = useState<Achievement | null>(
		null
	);

	// Initialize session tracking
	useEffect(() => {
		const initSession = async () => {
			await initializeSession();
		};

		initSession();

		// Handle app state changes for session tracking
		const handleAppStateChange = (nextAppState: string) => {
			if (nextAppState === 'background' || nextAppState === 'inactive') {
				finalizeSession();
			} else if (nextAppState === 'active') {
				initializeSession();
			}
		};

		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		);

		return () => {
			finalizeSession();
			subscription?.remove();
		};
	}, []);

	const dismissAchievementPopup = () => {
		setShowAchievementPopup(false);
		setNewAchievement(null);
	};

	const addNewAchievement = useCallback((achievement: Achievement) => {
		setNewAchievement(achievement);
		setShowAchievementPopup(true);

		// Auto-dismiss after 3 seconds
		setTimeout(() => {
			dismissAchievementPopup();
		}, 3000);
	}, []);

	// Load achievements on component mount
	useEffect(() => {
		refreshAchievements();

		// Set up a global listener for new achievements
		const checkForNewAchievements = () => {
			// This will be called when achievements need to be refreshed
			refreshAchievements();
		};

		// Make this function globally available for the database service
		(global as any).refreshAchievements = checkForNewAchievements;
		(global as any).addNewAchievement = addNewAchievement;

		return () => {
			(global as any).refreshAchievements = undefined;
			(global as any).addNewAchievement = undefined;
		};
	}, [addNewAchievement]);

	const refreshAchievements = async (stats?: {
		totalWins: number;
		totalGames: number;
		consecutiveWins: number;
	}) => {
		try {
			// Use provided stats or default values
			const defaultStats = { totalWins: 0, totalGames: 0, consecutiveWins: 0 };
			const currentStats = stats || defaultStats;

			const allAchievements = await getAllAchievements(currentStats);
			setAchievements(allAchievements);

			const unlocked = allAchievements.filter(
				(achievement) => achievement.unlocked
			);
			setUnlockedAchievements(unlocked);
		} catch (error) {
			console.error('Error refreshing achievements:', error);
		}
	};

	const getAchievementsByCategory = (category: string): Achievement[] => {
		return achievements.filter(
			(achievement) => achievement.category === category
		);
	};

	const getUnlockedCount = (): number => {
		return achievements.filter((achievement) => achievement.unlocked).length;
	};

	const getTotalCount = (): number => {
		return achievements.length;
	};

	const contextValue: AchievementsContextType = {
		achievements,
		unlockedAchievements,
		showAchievementPopup,
		newAchievement,
		refreshAchievements,
		dismissAchievementPopup,
		addNewAchievement,
		getAchievementsByCategory,
		getUnlockedCount,
		getTotalCount,
	};

	return (
		<AchievementsContext.Provider value={contextValue}>
			{children}
		</AchievementsContext.Provider>
	);
}

export const useAchievements = () => {
	const context = useContext(AchievementsContext);
	if (!context) {
		throw new Error('useAchievements must be used within AchievementsProvider');
	}
	return context;
};
