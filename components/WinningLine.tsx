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
		console.log('WinningLine: Triggering animation');
		if (completionTimeoutRef.current) {
			clearTimeout(completionTimeoutRef.current);
		}
		// Reset animation values
		scaleX.value = 0;
		opacity.value = 0;

		opacity.value = withTiming(1, { duration: 300 });
		scaleX.value = withTiming(1, { duration: 800 });

		completionTimeoutRef.current = setTimeout(() => {
			console.log(
				'WinningLine: Animation complete, calling onAnimationComplete'
			);
			onAnimationComplete();
			completionTimeoutRef.current = null;
		}, 2300);
	}, [onAnimationComplete, opacity, scaleX]);

	useEffect(() => {
		if (winPattern) {
			console.log('WinningLine: New winning pattern detected:', winPattern);
			console.log('WinningLine: Cell size:', cellSize);
			setIsVisible(true);
			triggerAnimation();
		} else {
			console.log('WinningLine: No winning pattern, hiding line');
			setIsVisible(false);
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
				completionTimeoutRef.current = null;
			}
		}
	}, [winPattern, triggerAnimation, cellSize]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scaleX: scaleX.value }],
	}));

	const lineStyle = useMemo(() => {
		if (!winPattern || winPattern.length !== 3) {
			console.warn('WinningLine: Invalid win pattern length:', winPattern);
			return null;
		}

		try {
			// Ensure pattern is sorted for consistent line drawing
			const sortedPattern = [...winPattern].sort((x, y) => x - y);
			const [a, b, c] = sortedPattern;

			// Validate pattern indices
			if (a < 0 || a > 8 || b < 0 || b > 8 || c < 0 || c > 8) {
				console.error('WinningLine: Invalid winning pattern indices:', sortedPattern);
				return null;
			}

			// Validate that all indices are unique
			if (a === b || b === c || a === c) {
				console.error('WinningLine: Duplicate indices in pattern:', sortedPattern);
				return null;
			}

			// Calculate positions for the first and last cells in the pattern
			// This ensures the line covers the entire winning combination
			const startRow = Math.floor(a / 3);
			const startCol = a % 3;
			const endRow = Math.floor(c / 3);
			const endCol = c % 3;

			// Calculate exact center positions
			const startX = startCol * cellSize + cellSize / 2;
			const startY = startRow * cellSize + cellSize / 2;
			const endX = endCol * cellSize + cellSize / 2;
			const endY = endRow * cellSize + cellSize / 2;

			// Calculate line properties
			const deltaX = endX - startX;
			const deltaY = endY - startY;
			const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

			// Calculate center position for the line
			const centerX = startX + deltaX / 2;
			const centerY = startY + deltaY / 2;

			// Add a small buffer to ensure the line extends slightly beyond cell centers
			const buffer = 2;
			const adjustedLength = length + buffer * 2;

			const lineStyle = {
				position: 'absolute' as const,
				left: centerX - adjustedLength / 2,
				top: centerY - 3, // Half the line height
				width: adjustedLength,
				height: 6,
				backgroundColor: '#fbbf24',
				borderRadius: 3,
				transform: [{ rotate: `${angle}deg` }],
			};

			console.log('WinningLine: Calculated line style:', {
				pattern: sortedPattern,
				start: `(${startX}, ${startY})`,
				end: `(${endX}, ${endY})`,
				center: `(${centerX}, ${centerY})`,
				length: length.toFixed(2),
				adjustedLength: adjustedLength.toFixed(2),
				angle: angle.toFixed(2),
				position: `(${lineStyle.left}, ${lineStyle.top})`,
				size: `${lineStyle.width}x${lineStyle.height}`,
			});

			return lineStyle;
		} catch (error) {
			console.error('Error calculating line style:', error);
			return null;
		}
	}, [winPattern, cellSize]);

	if (!isVisible || !winPattern || !lineStyle) {
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
