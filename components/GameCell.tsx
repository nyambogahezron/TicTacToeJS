import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
} from 'react-native-reanimated';
import { useGame } from '../context/GameProvider';
import { useAudio } from '../context/AudioProvider';

interface GameCellProps {
	index: number;
	value: 'X' | 'O' | null;
	size: number;
	disabled: boolean;
}

export default function GameCell({
	index,
	value,
	size,
	disabled,
}: GameCellProps) {
	const { dispatch } = useGame();
	const { playSound, triggerHaptic } = useAudio();
	const scale = useSharedValue(1);
	const rotate = useSharedValue(0);
	const opacity = useSharedValue(value ? 1 : 0);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
	}));

	const textAnimatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: opacity.value }],
	}));

	const triggerHapticFeedback = () => {
		if (Platform.OS !== 'web') {
			// Would use Haptics.impactAsync() on mobile
		}
	};

	React.useEffect(() => {
		if (value) {
			opacity.value = withSpring(1, { damping: 8 });
			rotate.value = withSequence(
				withSpring(-10, { damping: 8 }),
				withSpring(0, { damping: 8 })
			);
		}
	}, [value]);

	const handlePress = async () => {
		if (disabled || value) return;

		scale.value = withSequence(
			withSpring(0.9, { damping: 15 }),
			withSpring(1, { damping: 15 })
		);

		await Promise.all([playSound('move'), triggerHaptic('medium')]);

		setTimeout(() => {
			dispatch({ type: 'MAKE_MOVE', index });
		}, 100);
	};

	const getTextColor = () => {
		if (value === 'X') return '#10b981';
		if (value === 'O') return '#ef4444';
		return '#fff';
	};

	const getBorderColor = () => {
		if (value === 'X') return 'rgba(16, 185, 129, 0.3)';
		if (value === 'O') return 'rgba(239, 68, 68, 0.3)';
		return 'rgba(255, 255, 255, 0.1)';
	};

	return (
		<Animated.View style={animatedStyle}>
			<TouchableOpacity
				style={[
					styles.cell,
					{
						width: size,
						height: size,
						borderColor: getBorderColor(),
					},
				]}
				onPress={handlePress}
				disabled={disabled || !!value}
				activeOpacity={0.8}
			>
				<BlurView intensity={20} style={styles.blur}>
					<Animated.Text
						style={[
							styles.cellText,
							textAnimatedStyle,
							{ color: getTextColor(), fontSize: size * 0.4 },
						]}
					>
						{value}
					</Animated.Text>
				</BlurView>
			</TouchableOpacity>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	cell: {
		borderRadius: 16,
		borderWidth: 2,
		overflow: 'hidden',
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	blur: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cellText: {
		fontFamily: 'Inter-Bold',
		textAlign: 'center',
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},
});
