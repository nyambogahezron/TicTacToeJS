import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
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
	const { dispatch, state } = useGame();
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

	React.useEffect(() => {
		if (value) {
			opacity.value = withSpring(1, { damping: 8 });
			rotate.value = withSequence(
				withSpring(-10, { damping: 8 }),
				withSpring(0, { damping: 8 })
			);
		}
	}, [value, opacity, rotate]);

	const handlePress = async () => {
		if (disabled) return;

		// In placement phase, allow placing if cell is empty
		if (state.gamePhase === 'placement') {
			if (value) return;

			scale.value = withSequence(
				withSpring(0.9, { damping: 15 }),
				withSpring(1, { damping: 15 })
			);

			await Promise.all([playSound('move'), triggerHaptic('medium')]);

			setTimeout(() => {
				dispatch({ type: 'MAKE_MOVE', index });
			}, 100);
		}
		// In movement phase, handle piece selection and movement
		else if (state.gamePhase === 'movement') {
			// If no piece is selected and this cell has current player's piece, select it
			if (state.selectedPiece === null) {
				if (value !== state.currentPlayer) return;

				scale.value = withSequence(
					withSpring(0.9, { damping: 15 }),
					withSpring(1, { damping: 15 })
				);

				await Promise.all([playSound('move'), triggerHaptic('medium')]);

				setTimeout(() => {
					dispatch({ type: 'SELECT_PIECE', index });
				}, 100);
			}
			// If a piece is selected and this cell is empty, try to move
			else {
				if (value !== null) {
					// If clicking on another piece of the same player, select that piece instead
					if (value === state.currentPlayer) {
						scale.value = withSequence(
							withSpring(0.9, { damping: 15 }),
							withSpring(1, { damping: 15 })
						);

						await Promise.all([playSound('move'), triggerHaptic('medium')]);

						setTimeout(() => {
							dispatch({ type: 'SELECT_PIECE', index });
						}, 100);
					}
					return;
				}

				// Check if move is valid (adjacent to selected piece)
				const adjacentCells = getAdjacentCells(state.selectedPiece);
				if (!adjacentCells.includes(index)) return;

				scale.value = withSequence(
					withSpring(0.9, { damping: 15 }),
					withSpring(1, { damping: 15 })
				);

				await Promise.all([playSound('move'), triggerHaptic('medium')]);

				setTimeout(() => {
					dispatch({
						type: 'MOVE_PIECE',
						from: state.selectedPiece!,
						to: index,
					});
				}, 100);
			}
		}
	};

	const getTextColor = () => {
		if (value === 'X') return '#10b981';
		if (value === 'O') return '#ef4444';
		return '#fff';
	};

	const getBorderColor = () => {
		// Highlight selected piece
		if (state.selectedPiece === index) {
			return '#fbbf24'; // Yellow for selected
		}

		// Show valid move targets when a piece is selected
		if (
			state.selectedPiece !== null &&
			value === null &&
			state.gamePhase === 'movement'
		) {
			const adjacentCells = getAdjacentCells(state.selectedPiece);
			if (adjacentCells.includes(index)) {
				return 'rgba(251, 191, 36, 0.5)'; // Light yellow for valid targets
			}
		}

		if (value === 'X') return 'rgba(16, 185, 129, 0.3)';
		if (value === 'O') return 'rgba(239, 68, 68, 0.3)';
		return 'rgba(255, 255, 255, 0.1)';
	};

	const getBorderWidth = () => {
		// Thicker border for selected piece
		if (state.selectedPiece === index) {
			return 3;
		}
		return 2;
	};

	// Helper function to get adjacent cells (same as in GameProvider)
	const getAdjacentCells = (cellIndex: number): number[] => {
		const adjacencyMap: { [key: number]: number[] } = {
			0: [1, 3, 4],
			1: [0, 2, 3, 4, 5],
			2: [1, 4, 5],
			3: [0, 1, 4, 6, 7],
			4: [0, 1, 2, 3, 5, 6, 7, 8],
			5: [1, 2, 4, 7, 8],
			6: [3, 4, 7],
			7: [3, 4, 5, 6, 8],
			8: [4, 5, 7],
		};
		return adjacencyMap[cellIndex] || [];
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
						borderWidth: getBorderWidth(),
					},
				]}
				onPress={handlePress}
				disabled={disabled}
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
