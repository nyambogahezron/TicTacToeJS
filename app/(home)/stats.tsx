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
import { Trophy, Target, Zap, Award } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
	const stats = {
		wins: 23,
		losses: 12,
		draws: 8,
		winRate: 85,
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
		<LinearGradient
			colors={['#0f172a', '#1e293b', '#334155']}
			style={styles.container}
		>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.content}>
					<Animated.Text entering={FadeInUp.springify()} style={styles.title}>
						Your Statistics
					</Animated.Text>

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
	title: {
		fontSize: 32,
		fontFamily: 'Inter-Bold',
		color: '#fff',
		textAlign: 'center',
		marginBottom: 40,
	},
	statsGrid: {
		gap: 16,
	},
	card: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
		color: '#fff',
		marginBottom: 4,
	},
	cardTitle: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		color: '#94a3b8',
	},
});
