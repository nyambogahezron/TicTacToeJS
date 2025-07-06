import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
	SlideInDown,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
	runOnJS,
} from 'react-native-reanimated';
import { Coins } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';

interface CoinPopupProps {
	amount: number;
	onComplete: () => void;
}

export default function CoinPopup({ amount, onComplete }: CoinPopupProps) {
	const { colors } = useTheme();
	const scale = useSharedValue(0.8);
	const translateY = useSharedValue(0);
	const opacity = useSharedValue(1);

	useEffect(() => {
		// Animate in
		scale.value = withSpring(1, { damping: 15 });
		translateY.value = withSpring(-20, { damping: 15 });

		// Animate out after delay
		const timer = setTimeout(() => {
			opacity.value = withTiming(0, { duration: 300 });
			translateY.value = withTiming(20, { duration: 300 }, (finished) => {
				if (finished) {
					runOnJS(onComplete)();
				}
			});
		}, 3000);

		return () => clearTimeout(timer);
	}, [onComplete, scale, translateY, opacity]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }, { translateY: translateY.value }],
		opacity: opacity.value,
	}));

	return (
		<Animated.View
			entering={SlideInDown.springify()}
			style={[styles.container, animatedStyle]}
		>
			<View style={styles.backdrop}>
				<BlurView intensity={40} style={styles.blur}>
					<View style={[styles.content, { backgroundColor: colors.card }]}>
						<View
							style={[styles.iconContainer, { backgroundColor: '#f59e0b' }]}
						>
							<Coins size={24} color='#fff' />
						</View>
						<Text style={[styles.text, { color: colors.text }]}>
							+{amount} coins
						</Text>
					</View>
				</BlurView>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 40,
		left: 0,
		right: 0,
		alignItems: 'center',
		zIndex: 1000,
	},
	backdrop: {
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		borderRadius: 24,
		paddingHorizontal: 4,
		paddingVertical: 4,
	},
	blur: {
		borderRadius: 20,
		overflow: 'hidden',
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.3)',
	},
	iconContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
});
