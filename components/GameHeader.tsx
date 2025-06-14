import { Bot, RotateCcw, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { useGame } from './GameProvider';

export default function GameHeader() {
	const { state, dispatch } = useGame();
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
		if (state.currentPlayer === 'X') return 'Your Turn';
		return state.gameMode === 'vsAI' ? 'AI Thinking...' : "Player O's Turn";
	};

	const getStatusColor = () => {
		if (state.winner === 'X') return '#10b981';
		if (state.winner === 'O') return '#ef4444';
		if (state.winner === 'draw') return '#f59e0b';
		return '#60a5fa';
	};

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

				<Animated.View style={resetButtonStyle}>
					<TouchableOpacity
						style={styles.resetButton}
						onPress={handleReset}
						activeOpacity={0.8}
					>
						<RotateCcw size={20} color='#fff' />
					</TouchableOpacity>
				</Animated.View>
			</View>

			<View style={styles.scoreContainer}>
				<View style={styles.scoreItem}>
					<View style={[styles.scoreIcon, { backgroundColor: '#10b981' }]}>
						<User size={16} color='#fff' />
					</View>
					<Text style={styles.scoreText}>You: {state.score.X}</Text>
				</View>

				<View style={styles.scoreItem}>
					<View style={[styles.scoreIcon, { backgroundColor: '#f59e0b' }]}>
						<Text style={styles.drawText}>D</Text>
					</View>
					<Text style={styles.scoreText}>Draw: {state.score.draws}</Text>
				</View>

				<View style={styles.scoreItem}>
					<View style={[styles.scoreIcon, { backgroundColor: '#ef4444' }]}>
						{state.gameMode === 'vsAI' ? (
							<Bot size={16} color='#fff' />
						) : (
							<User size={16} color='#fff' />
						)}
					</View>
					<Text style={styles.scoreText}>
						{state.gameMode === 'vsAI' ? 'AI' : 'Player 2'}: {state.score.O}
					</Text>
				</View>
			</View>
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
		backgroundColor: 'rgba(96, 165, 250, 0.2)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		alignSelf: 'flex-start',
	},
	status: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
		color: '#60a5fa',
	},
	resetButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	scoreContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
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
		color: '#94a3b8',
		textAlign: 'center',
	},
});
