import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
	Trophy,
	Target,
	Zap,
	Award,
	ArrowLeft,
	Coins,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useGame } from '@/context/GameProvider';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
	const router = useRouter();
	const { colors } = useTheme();
	const { state } = useGame();

	const stats = {
		wins: state.score.X,
		losses: state.score.O,
		draws: state.score.draws,
		winRate:
			state.score.X + state.score.O + state.score.draws > 0
				? Math.round(
						(state.score.X /
							(state.score.X + state.score.O + state.score.draws)) *
							100
				  )
				: 0,
		coins: state.coins,
	};

	const StatCard = ({ icon: Icon, title, value, color }: any) => (
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
					{value}
				</Text>
				<Text style={[styles.cardTitle, { color: colors.cardSubtext }]}>
					{title}
				</Text>
			</View>
		</Animated.View>
	);

	return (
		<LinearGradient colors={colors.background} style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.content}>
					<View style={styles.header}>
						<TouchableOpacity
							style={styles.backButton}
							onPress={() => router.back()}
							activeOpacity={0.8}
						>
							<ArrowLeft size={24} color={colors.text} />
						</TouchableOpacity>
						<Animated.Text
							entering={FadeInUp.springify()}
							style={[styles.title, { color: colors.text }]}
						>
							Your Statistics
						</Animated.Text>
						<View style={styles.backButton} />
					</View>

					<Animated.View
						entering={FadeInUp.delay(100).springify()}
						style={[styles.coinCard, { backgroundColor: colors.card }]}
					>
						<View style={[styles.coinIcon, { backgroundColor: '#f59e0b' }]}>
							<Coins size={24} color='#fff' />
						</View>
						<View style={styles.coinContent}>
							<Text style={[styles.coinValue, { color: colors.cardText }]}>
								{stats.coins}
							</Text>
							<Text style={[styles.coinTitle, { color: colors.cardSubtext }]}>
								Total Coins
							</Text>
						</View>
					</Animated.View>

					<View style={styles.statsGrid}>
						<StatCard
							icon={Trophy}
							title='Wins'
							value={stats.wins}
							color='#10b981'
						/>
						<StatCard
							icon={Target}
							title='Losses'
							value={stats.losses}
							color='#ef4444'
						/>
						<StatCard
							icon={Zap}
							title='Draws'
							value={stats.draws}
							color='#f59e0b'
						/>
						<StatCard
							icon={Award}
							title='Win Rate'
							value={`${stats.winRate}%`}
							color='#60a5fa'
						/>
					</View>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 40,
	},
	backButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 32,
		fontFamily: 'Inter-Bold',
		textAlign: 'center',
	},
	statsGrid: {
		gap: 16,
	},
	card: {
		borderRadius: 16,
		padding: 20,
		flexDirection: 'row',
		alignItems: 'center',
		borderLeftWidth: 4,
		backdropFilter: 'blur(10px)',
	},
	cardIcon: {
		marginRight: 16,
	},
	cardContent: {
		flex: 1,
	},
	cardValue: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
		marginBottom: 4,
	},
	cardTitle: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
	coinCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderRadius: 16,
		marginBottom: 20,
		borderLeftWidth: 4,
		borderLeftColor: '#f59e0b',
	},
	coinIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	coinContent: {
		flex: 1,
	},
	coinValue: {
		fontSize: 24,
		fontFamily: 'Inter-Bold',
		marginBottom: 4,
	},
	coinTitle: {
		fontSize: 14,
		fontFamily: 'Inter-Medium',
	},
});
