import React, { createContext, useContext, ReactNode } from 'react';
import { Achievement } from '@/services/achievements';

interface AchievementNotificationContextType {
	notifyNewAchievements: (achievements: Achievement[]) => void;
}

const AchievementNotificationContext =
	createContext<AchievementNotificationContextType | null>(null);

export function AchievementNotificationProvider({
	children,
	onNewAchievements,
}: {
	children: ReactNode;
	onNewAchievements: (achievements: Achievement[]) => void;
}) {
	const notifyNewAchievements = (achievements: Achievement[]) => {
		if (achievements.length > 0) {
			onNewAchievements(achievements);
		}
	};

	return (
		<AchievementNotificationContext.Provider value={{ notifyNewAchievements }}>
			{children}
		</AchievementNotificationContext.Provider>
	);
}

export const useAchievementNotification = () => {
	const context = useContext(AchievementNotificationContext);
	if (!context) {
		throw new Error(
			'useAchievementNotification must be used within AchievementNotificationProvider'
		);
	}
	return context;
};
