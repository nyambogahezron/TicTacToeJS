import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
	Trophy,
	Target,
	Zap,
	Award,
	ArrowLeft,
	Coins,
	TrendingUp,
	GamepadIcon,
	Flame,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useGame } from '@/context/GameProvider';
import { useRouter } from 'expo-router';
import { getStats } from '@/services/database';

export default function StatsScreen() {
	const { colors } = useTheme();
	const { state } = useGame();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [dbStats, setDbStats] = useState({
		gamesPlayed: 0,
		gamesWon: 0,
		highestScore: 0,
		totalScore: 0,
	});

	useEffect(() => {
		const loadStats = async () => {
			try {
				const stats = await getStats();
				setDbStats(stats);
			} catch (error) {
				console.error('Error loading stats:', error);
			}
		};
		loadStats();
	}, []);

	// Calculate comprehensive stats
	const totalGames = state.score.X + state.score.O + state.score.draws;
	const winRate =
		totalGames > 0 ? Math.round((state.score.X / totalGames) * 100) : 0;
	const drawRate =
		totalGames > 0 ? Math.round((state.score.draws / totalGames) * 100) : 0;

	const stats = {
		wins: state.score.X,
		losses: state.score.O,
		draws: state.score.draws,
		totalGames,
		winRate,
		coins: state.coins,
		consecutiveWins: state.consecutiveWins,
		gamesPlayed: dbStats.gamesPlayed,
		currentGameMode: state.gameMode === 'vsAI' ? 'vs AI' : 'vs Player',
		gameLevel: state.gameLevel,
	};

	const StatCard = ({
		icon: Icon,
		title,
		value,
		color,
		subtitle,
		isText = false,
	}: any) => (
		<Animated.View
			entering={FadeInUp.delay(200).springify()}
			style={[
				styles.card,
				{ borderLeftColor: color, backgroundColor: colors.card },
			]}
		>
			<View style={styles.cardIcon}>
				<Icon size={24} color={color} />
			</View>
			<View style={styles.cardContent}>
				<Text style={[styles.cardValue, { color: colors.cardText }]}>
					{isText
						? value
						: typeof value === 'number'
						? value.toLocaleString()
						: value}
				</Text>
				<Text style={[styles.cardTitle, { color: colors.cardSubtext }]}>
					{title}
				</Text>
				{subtitle && (
					<Text style={[styles.cardSubtitle, { color: colors.cardSubtext }]}>
						{subtitle}
					</Text>
				)}
			</View>
		</Animated.View>
	);

	return (
		<LinearGradient
			colors={['#0f172a', '#1e293b', '#334155']}
			style={styles.container}
		>
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
							Your Statistics
						</Text>
					</View>
				</Animated.View>

				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{/* Main Stats Grid */}
					<View style={styles.statsGrid}>
						<StatCard
							icon={Trophy}
							title='Wins'
							value={stats.wins}
							color='#10b981'
							subtitle={`${stats.winRate}% win rate`}
						/>
						<StatCard
							icon={Target}
							title='Losses'
							value={stats.losses}
							color='#ef4444'
							subtitle={`vs ${stats.currentGameMode}`}
						/>
						<StatCard
							icon={Zap}
							title='Draws'
							value={stats.draws}
							color='#f59e0b'
							subtitle={`${drawRate}% of games`}
						/>
						<StatCard
							icon={Award}
							title='Total Games'
							value={stats.totalGames}
							color='#60a5fa'
							subtitle={`Level ${stats.gameLevel}`}
						/>
					</View>

					{/* Additional Stats */}
					<View style={styles.additionalStats}>
						<StatCard
							icon={Coins}
							title='Coins'
							value={stats.coins}
							color='#f59e0b'
							subtitle='Earned from wins'
						/>
						<StatCard
							icon={Flame}
							title='Win Streak'
							value={stats.consecutiveWins}
							color='#f97316'
							subtitle='Current streak'
						/>
						<StatCard
							icon={GamepadIcon}
							title='Game Mode'
							value={stats.currentGameMode}
							color='#8b5cf6'
							isText={true}
							subtitle={`Level ${stats.gameLevel}`}
						/>
						<StatCard
							icon={TrendingUp}
							title='Performance'
							value={
								stats.winRate > 60
									? 'Excellent'
									: stats.winRate > 40
									? 'Good'
									: 'Improving'
							}
							color={
								stats.winRate > 60
									? '#10b981'
									: stats.winRate > 40
									? '#f59e0b'
									: '#ef4444'
							}
							isText={true}
							subtitle={`${stats.winRate}% wins`}
						/>
					</View>
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
		paddingTop: 20,
		paddingBottom: 20,
		borderBottomWidth: 1,
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
		fontSize: 28,
		fontFamily: 'Inter-Bold',
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	statsGrid: {
		gap: 16,
		marginBottom: 32,
	},
	additionalStats: {
		gap: 16,
	},
	card: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 16,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		borderLeftWidth: 4,
		backdropFilter: 'blur(10px)',
	},
	cardIcon: {
		marginRight: 12,
	},
	cardContent: {
		flex: 1,
	},
	cardValue: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
		color: '#fff',
		marginBottom: 4,
	},
	cardTitle: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		color: '#94a3b8',
		marginBottom: 2,
	},
	cardSubtitle: {
		fontSize: 12,
		fontFamily: 'Inter-Regular',
		color: '#64748b',
	},
});
