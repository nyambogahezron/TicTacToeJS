import {
	Bot,
	RotateCcw,
	User,
	Settings,
	BarChart2,
	Coins,
} from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { useGame } from '../context/GameProvider';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';

export default function GameHeader() {
	const { state, dispatch } = useGame();
	const router = useRouter();
	const { colors } = useTheme();
	const scale = useSharedValue(1);

	const resetButtonStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handleReset = () => {
		scale.value = withSpring(0.9, { duration: 100 }, () => {
			scale.value = withSpring(1);
		});
		dispatch({ type: 'RESET_GAME' });
	};

	const getStatusText = () => {
		if (state.winner === 'draw') return "It's a Draw!";
		if (state.winner === 'X') return 'You Win!';
		if (state.winner === 'O')
			return state.gameMode === 'vsAI' ? 'AI Wins!' : 'Player O Wins!';

		// Show whose turn it is
		if (state.currentPlayer === 'X') {
			return 'Your Turn';
		} else {
			return state.gameMode === 'vsAI' ? 'AI Turn' : "Player O's Turn";
		}
	};

	const getStatusColor = () => {
		if (state.winner === 'X') return '#10b981';
		if (state.winner === 'O') return '#ef4444';
		if (state.winner === 'draw') return '#f59e0b';
		return '#60a5fa';
	};

	const IconButton = ({ icon: Icon, onPress, color = colors.text }: any) => (
		<TouchableOpacity
			style={[styles.iconButton, { borderColor: colors.border }]}
			onPress={onPress}
			activeOpacity={0.8}
		>
			<Icon size={20} color={color} />
		</TouchableOpacity>
	);

	return (
		<Animated.View entering={FadeInUp.springify()} style={styles.container}>
			<View style={styles.header}>
				<View style={styles.titleSection}>
					<View
						style={[
							styles.statusContainer,
							{ backgroundColor: getStatusColor() + '20' },
						]}
					>
						<Text style={[styles.status, { color: getStatusColor() }]}>
							{getStatusText()}
						</Text>
					</View>
				</View>

				<View style={styles.buttonGroup}>
					<View style={[styles.coinDisplay, { backgroundColor: colors.card }]}>
						<Coins size={16} color='#f59e0b' />
						<Text style={[styles.coinText, { color: colors.text }]}>
							{state.coins}
						</Text>
					</View>
					<IconButton
						icon={BarChart2}
						onPress={() => router.push('/stats')}
						color='#60a5fa'
					/>
					<IconButton
						icon={Settings}
						onPress={() => router.push('/settings')}
						color='#f59e0b'
					/>
					<Animated.View style={resetButtonStyle}>
						<TouchableOpacity
							style={[styles.resetButton, { borderColor: colors.border }]}
							onPress={handleReset}
							activeOpacity={0.8}
						>
							<RotateCcw size={20} color={colors.text} />
						</TouchableOpacity>
					</Animated.View>
				</View>
			</View>

			<View
				style={[
					styles.scoreContainer,
					{
						backgroundColor: colors.card,
						borderColor: colors.border,
					},
				]}
			>
				<View style={styles.scoreItem}>
					<View style={[styles.scoreIcon, { backgroundColor: '#10b981' }]}>
						<User size={16} color='#fff' />
					</View>
					<Text style={[styles.scoreText, { color: colors.cardSubtext }]}>
						You: {state.score.X}
					</Text>
				</View>

				<View style={styles.scoreItem}>
					<View style={[styles.scoreIcon, { backgroundColor: '#f59e0b' }]}>
						<Text style={styles.drawText}>D</Text>
					</View>
					<Text style={[styles.scoreText, { color: colors.cardSubtext }]}>
						Draw: {state.score.draws}
					</Text>
				</View>

				<View style={styles.scoreItem}>
					<View style={[styles.scoreIcon, { backgroundColor: '#ef4444' }]}>
						{state.gameMode === 'vsAI' ? (
							<Bot size={16} color='#fff' />
						) : (
							<User size={16} color='#fff' />
						)}
					</View>
					<Text style={[styles.scoreText, { color: colors.cardSubtext }]}>
						{state.gameMode === 'vsAI' ? 'AI' : 'Player 2'}: {state.score.O}
					</Text>
				</View>
			</View>

			{/* Game Phase Indicator - Only for Level 2 */}
			{!state.winner && state.gameLevel === 2 && (
				<View
					style={[
						styles.phaseContainer,
						{ backgroundColor: colors.card, borderColor: colors.border },
					]}
				>
					<Text style={[styles.phaseText, { color: colors.cardSubtext }]}>
						{state.gamePhase === 'placement'
							? '📍 Placement Phase'
							: '🔄 Movement Phase'}
					</Text>
					{state.gamePhase === 'placement' && (
						<Text style={[styles.piecesText, { color: colors.cardSubtext }]}>
							X: {state.piecesPlaced.X}/3 | O: {state.piecesPlaced.O}/3
						</Text>
					)}
				</View>
			)}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 30,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	titleSection: {
		flex: 1,
	},
	statusContainer: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		alignSelf: 'flex-start',
	},
	status: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
	},
	buttonGroup: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center',
	},
	iconButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
	},
	resetButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
	},
	scoreContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
	},
	scoreItem: {
		alignItems: 'center',
		flex: 1,
	},
	scoreIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	drawText: {
		fontSize: 14,
		fontFamily: 'Inter-Bold',
		color: '#fff',
	},
	scoreText: {
		fontSize: 12,
		fontFamily: 'Inter-SemiBold',
		textAlign: 'center',
	},
	coinDisplay: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	coinText: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
	},
	phaseContainer: {
		marginTop: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: 'center',
	},
	phaseText: {
		fontSize: 13,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 4,
	},
	piecesText: {
		fontSize: 11,
		fontFamily: 'Inter-Medium',
	},
});
