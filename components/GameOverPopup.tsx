import React from 'react';
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
import { useGame } from './GameProvider';

const { width } = Dimensions.get('window');

export default function GameOverPopup() {
	const { state } = useGame();
	const scale = useSharedValue(0.8);

	React.useEffect(() => {
		if (state.winner) {
			scale.value = withSpring(1, { damping: 15 });
		}
	}, [state.winner]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	if (!state.winner) return null;

	const getIcon = () => {
		if (state.winner === 'X') return <Trophy size={48} color='#10b981' />;
		if (state.winner === 'O') return <XCircle size={48} color='#ef4444' />;
		return <Handshake size={48} color='#f59e0b' />;
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
					style={[styles.popup, animatedStyle, { borderColor: getColor() }]}
				>
					<View style={styles.iconContainer}>{getIcon()}</View>
					<Text style={[styles.message, { color: getColor() }]}>
						{getMessage()}
					</Text>
					<Text style={styles.subMessage}>
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
		zIndex: 1000,
	},
	blur: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
	},
	popup: {
		width: width - 40,
		backgroundColor: 'rgba(15, 23, 42, 0.95)',
		borderRadius: 24,
		padding: 24,
		alignItems: 'center',
		borderWidth: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 12,
		elevation: 8,
	},
	iconContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16,
	},
	message: {
		fontSize: 32,
		fontFamily: 'Inter-Bold',
		marginBottom: 8,
		textAlign: 'center',
	},
	subMessage: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
		color: '#94a3b8',
		textAlign: 'center',
	},
});
