import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
	ArrowLeft,
	Award,
	Trophy,
	Clock,
	Calendar,
	Target,
	Star,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAchievements } from '@/context/AchievementsProvider';

export default function AchievementsScreen() {
	const { colors } = useTheme();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const {
		achievements,
		getAchievementsByCategory,
		getUnlockedCount,
		getTotalCount,
	} = useAchievements();
	const [selectedCategory, setSelectedCategory] = useState<string>('all');

	const categories = [
		{ id: 'all', name: 'All', icon: Star },
		{ id: 'wins', name: 'Wins', icon: Trophy },
		{ id: 'streaks', name: 'Streaks', icon: Target },
		{ id: 'time', name: 'Time', icon: Clock },
		{ id: 'daily', name: 'Daily', icon: Calendar },
		{ id: 'milestones', name: 'Milestones', icon: Award },
	];

	const getFilteredAchievements = () => {
		if (selectedCategory === 'all') {
			return achievements;
		}
		return getAchievementsByCategory(selectedCategory);
	};

	const getCategoryIcon = (category: string) => {
		const categoryData = categories.find((c) => c.id === category);
		return categoryData?.icon || Star;
	};

	const getCategoryColor = (category: string) => {
		const colors: { [key: string]: string } = {
			wins: '#10b981',
			streaks: '#f59e0b',
			time: '#8b5cf6',
			daily: '#06b6d4',
			milestones: '#ef4444',
		};
		return colors[category] || '#6b7280';
	};

	const getProgressBarColor = (achievement: any) => {
		return achievement.unlocked ? '#10b981' : '#374151';
	};

	const getProgressPercentage = (achievement: any) => {
		return (achievement.progress / achievement.maxProgress) * 100;
	};

	const AchievementCard = ({
		achievement,
		index,
	}: {
		achievement: any;
		index: number;
	}) => {
		const Icon = getCategoryIcon(achievement.category);
		const categoryColor = getCategoryColor(achievement.category);
		const progressPercentage = getProgressPercentage(achievement);

		return (
			<View
				style={[
					styles.achievementCard,
					{
						borderColor: achievement.unlocked ? categoryColor : colors.border,
					},
				]}
			>
				<View style={styles.achievementHeader}>
					<View style={[styles.achievementIconContainer]}>
						<Text style={styles.achievementEmoji}>{achievement.icon}</Text>
						{achievement.unlocked && (
							<View
								style={[
									styles.unlockedBadge,
									{ backgroundColor: categoryColor },
								]}
							>
								<Icon size={12} color='#fff' />
							</View>
						)}
					</View>
					<View style={styles.achievementInfo}>
						<Text style={[styles.achievementTitle, { color: colors.cardText }]}>
							{achievement.title}
						</Text>
						<Text
							style={[
								styles.achievementDescription,
								{ color: colors.cardSubtext },
							]}
						>
							{achievement.description}
						</Text>
					</View>
					<View style={styles.rewardBadge}>
						<Text style={[styles.rewardText, { color: '#f59e0b' }]}>
							{achievement.coinReward}
						</Text>
					</View>
				</View>

				{/* Progress Bar */}
				<View style={styles.progressContainer}>
					<View
						style={[
							styles.progressBar,
							{
								backgroundColor: colors.border,
								opacity: 0.8,
							},
						]}
					>
						<View
							style={[
								styles.progressFill,
								{
									width: `${progressPercentage}%`,
									backgroundColor: getProgressBarColor(achievement),
								},
							]}
						/>
					</View>
					<Text style={[styles.progressText, { color: colors.cardSubtext }]}>
						{achievement.progress}/{achievement.maxProgress}
					</Text>
				</View>
			</View>
		);
	};

	const CategoryButton = ({ category }: { category: any }) => {
		const Icon = category.icon;
		const isSelected = selectedCategory === category.id;

		return (
			<TouchableOpacity
				style={[
					styles.categoryButton,
					{
						backgroundColor: isSelected ? colors.primary : '#1e293b',
						borderColor: isSelected ? colors.primary : '#475569',
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.25,
						shadowRadius: 4,
						elevation: 3,
					},
				]}
				onPress={() => setSelectedCategory(category.id)}
				activeOpacity={0.8}
			>
				<Icon size={20} color={isSelected ? '#fff' : '#e2e8f0'} />
				<Text
					style={[
						styles.categoryText,
						{
							color: isSelected ? '#fff' : '#e2e8f0',
							fontWeight: isSelected ? '600' : '500',
						},
					]}
				>
					{category.name}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<LinearGradient colors={colors.background} style={styles.container}>
			<View style={[styles.content, { paddingTop: insets.top }]}>
				{/* Header */}
				<Animated.View
					entering={FadeInUp.springify()}
					style={[styles.header, { borderBottomColor: colors.border }]}
				>
					<TouchableOpacity
						style={[styles.backButton, { backgroundColor: colors.card }]}
						onPress={() => router.back()}
						activeOpacity={0.8}
					>
						<ArrowLeft size={24} color={colors.cardText} />
					</TouchableOpacity>
					<View style={styles.headerTitle}>
						<Text style={[styles.title, { color: colors.cardText }]}>
							Achievements
						</Text>
						<Text style={[styles.subtitle, { color: colors.cardSubtext }]}>
							{getUnlockedCount()} of {getTotalCount()} unlocked
						</Text>
					</View>
				</Animated.View>

				{/* Category Filter */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.categoriesContainer}
					contentContainerStyle={styles.categoriesContent}
				>
					{categories.map((category) => (
						<CategoryButton key={category.id} category={category} />
					))}
				</ScrollView>

				{/* Achievements List */}
				<ScrollView
					style={styles.achievementsList}
					contentContainerStyle={styles.achievementsContent}
					showsVerticalScrollIndicator={false}
				>
					{getFilteredAchievements().map((achievement, index) => (
						<AchievementCard
							key={achievement.id}
							achievement={achievement}
							index={index}
						/>
					))}
				</ScrollView>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 5,
		paddingBottom: 20,
	},
	backButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	headerTitle: {
		flex: 1,
	},
	title: {
		fontSize: 25,
		fontFamily: 'Inter-Bold',
	},
	subtitle: {
		fontSize: 14,
		fontFamily: 'Inter-Medium',
		marginTop: 2,
	},
	categoriesContainer: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		maxHeight: 75,
	},
	categoriesContent: {
		gap: 12,
		paddingRight: 20,
	},
	categoryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 20,
		borderWidth: 1,
		gap: 8,
		minHeight: 35,
		minWidth: 80,
	},
	categoryText: {
		fontSize: 14,
		fontFamily: 'Inter-Medium',
	},
	achievementsList: {
		flex: 1,
		paddingHorizontal: 15,
		paddingTop: 0,
	},
	achievementsContent: {
		gap: 16,
		paddingBottom: 60,
		paddingTop: 8,
	},
	achievementCard: {
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderWidth: 1,
		minHeight: 100,
		maxHeight: 140,
		overflow: 'hidden',
	},
	achievementHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		minHeight: 60,
		maxHeight: 80,
		backgroundColor: 'transparent',
		paddingHorizontal: 0,
		paddingVertical: 0,
	},
	achievementIconContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
		position: 'relative',
		backgroundColor: 'transparent',
	},
	achievementEmoji: {
		fontSize: 28,
	},
	unlockedBadge: {
		position: 'absolute',
		bottom: -2,
		right: -2,
		width: 20,
		height: 20,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	achievementInfo: {
		flex: 1,
		justifyContent: 'center',
		paddingVertical: 4,
	},
	achievementTitle: {
		fontSize: 18,
		fontFamily: 'Inter-Bold',
		marginBottom: 4,
	},
	achievementDescription: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		lineHeight: 20,
	},
	rewardBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
		backgroundColor: 'rgba(245, 158, 11, 0.1)',
	},
	rewardText: {
		fontSize: 12,
		fontFamily: 'Inter-SemiBold',
	},
	progressContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		backgroundColor: 'transparent',
	},
	progressBar: {
		flex: 1,
		height: 6,
		borderRadius: 3,
		overflow: 'hidden',
		backgroundColor: 'transparent',
	},
	progressFill: {
		height: '100%',
		borderRadius: 3,
	},
	progressText: {
		fontSize: 12,
		fontFamily: 'Inter-Medium',
		minWidth: 40,
		textAlign: 'right',
	},
});
