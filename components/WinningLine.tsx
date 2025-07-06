import React, {
	useEffect,
	useState,
	useRef,
	memo,
	useMemo,
	useCallback,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

interface WinningLineProps {
	winPattern: number[] | null;
	cellSize: number;
	onAnimationComplete: () => void;
}

const WinningLine = memo(function WinningLine({
	winPattern,
	cellSize,
	onAnimationComplete,
}: WinningLineProps) {
	const scaleX = useSharedValue(0);
	const opacity = useSharedValue(0);
	const [isVisible, setIsVisible] = useState(false);
	const completionTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
			}
		};
	}, []);

	const triggerAnimation = useCallback(() => {
		if (completionTimeoutRef.current) {
			clearTimeout(completionTimeoutRef.current);
		}
		// Reset animation values
		scaleX.value = 0;
		opacity.value = 0;

		opacity.value = withTiming(1, { duration: 300 });
		scaleX.value = withTiming(1, { duration: 800 });

		completionTimeoutRef.current = setTimeout(() => {
			onAnimationComplete();
			completionTimeoutRef.current = null;
		}, 2300);
	}, [onAnimationComplete, opacity, scaleX]);

	useEffect(() => {
		if (winPattern) {
			setIsVisible(true);
			triggerAnimation();
		} else {
			setIsVisible(false);
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
				completionTimeoutRef.current = null;
			}
		}
	}, [winPattern, triggerAnimation]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scaleX: scaleX.value }],
	}));

	const lineStyle = useMemo(() => {
		if (!winPattern) return null;

		try {
			const [a, , c] = winPattern;

			const startRow = Math.floor(a / 3);
			const startCol = a % 3;
			const endRow = Math.floor(c / 3);
			const endCol = c % 3;

			const startX = startCol * cellSize + cellSize / 2;
			const startY = startRow * cellSize + cellSize / 2;
			const endX = endCol * cellSize + cellSize / 2;
			const endY = endRow * cellSize + cellSize / 2;

			const centerX = (startX + endX) / 2;
			const centerY = (startY + endY) / 2;
			const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
			const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

			return {
				position: 'absolute' as const,
				left: centerX - length / 2,
				top: centerY - 3,
				width: length,
				height: 6,
				backgroundColor: '#fbbf24',
				borderRadius: 3,
				transform: [{ rotate: `${angle}deg` }],
			};
		} catch (error) {
			console.error('Error calculating line style:', error);
			return null;
		}
	}, [winPattern, cellSize]);

	if (!isVisible || !winPattern) {
		return null;
	}

	if (!isVisible || !lineStyle) {
		return null;
	}

	return (
		<View style={styles.container}>
			<Animated.View style={[lineStyle, animatedStyle]} />
		</View>
	);
});

export default WinningLine;

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		pointerEvents: 'none',
	},
});
