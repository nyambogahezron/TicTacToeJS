import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
	FadeIn,
	FadeOut,
	SlideInDown,
	SlideOutDown,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { Trophy, XCircle, Handshake } from 'lucide-react-native';
import { useGame } from '../context/GameProvider';
import { useAudio } from '../context/AudioProvider';
import { useTheme } from '@/context/ThemeProvider';

const { width } = Dimensions.get('window');

export default function GameOverPopup() {
	const { state } = useGame();
	const { playSound, triggerHaptic } = useAudio();
	const { colors } = useTheme();
	const scale = useSharedValue(0.8);

	useEffect(() => {
		if (state.winner) {
			scale.value = withSpring(1, { damping: 15 });

			// Play appropriate sound and haptic based on game outcome
			const playGameEndEffects = async () => {
				if (state.winner === 'X') {
					await Promise.all([playSound('win'), triggerHaptic('success')]);
				} else if (state.winner === 'O') {
					await Promise.all([playSound('win'), triggerHaptic('error')]);
				} else {
					await Promise.all([playSound('draw'), triggerHaptic('medium')]);
				}
			};

			playGameEndEffects();
		}
	}, [state.winner, playSound, triggerHaptic, scale]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	if (!state.winner) return null;

	const getIcon = () => {
		if (state.winner === 'X') return <Trophy size={36} color='#10b981' />;
		if (state.winner === 'O') return <XCircle size={36} color='#ef4444' />;
		return <Handshake size={36} color='#f59e0b' />;
	};

	const getMessage = () => {
		if (state.winner === 'X') return 'You Won!';
		if (state.winner === 'O')
			return state.gameMode === 'vsAI' ? 'AI Won!' : 'Player O Won!';
		return "It's a Draw!";
	};

	const getColor = () => {
		if (state.winner === 'X') return '#10b981';
		if (state.winner === 'O') return '#ef4444';
		return '#f59e0b';
	};

	return (
		<Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
			<BlurView intensity={20} style={styles.blur}>
				<Animated.View
					entering={SlideInDown.springify()}
					exiting={SlideOutDown.springify()}
					style={[
						styles.popup,
						animatedStyle,
						{
							backgroundColor: colors.card,
							borderColor: getColor(),
						},
					]}
				>
					<View
						style={[styles.iconContainer, { backgroundColor: colors.border }]}
					>
						{getIcon()}
					</View>
					<Text style={[styles.message, { color: getColor() }]}>
						{getMessage()}
					</Text>
					<Text style={[styles.subMessage, { color: colors.cardSubtext }]}>
						{state.winner === 'draw'
							? 'Great game! Try again?'
							: 'Tap anywhere to play again'}
					</Text>
				</Animated.View>
			</BlurView>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.75)',
		zIndex: 9999,
	},
	blur: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
	},
	popup: {
		width: width - 40,
		borderRadius: 24,
		padding: 16,
		alignItems: 'center',
		borderWidth: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 12,
		elevation: 8,
	},
	iconContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 12,
	},
	message: {
		fontSize: 28,
		fontFamily: 'Inter-Bold',
		marginBottom: 6,
		textAlign: 'center',
	},
	subMessage: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
		textAlign: 'center',
	},
});
