import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { useGame } from '../context/GameProvider';
import { useAudio } from '../context/AudioProvider';

interface GameCellProps {
	index: number;
	value: 'X' | 'O' | null;
	size: number;
	disabled: boolean;
	cellBorders: {
		borderRightWidth: number;
		borderBottomWidth: number;
		borderColor: string;
	};
}

export default function GameCell({
	index,
	value,
	size,
	disabled,
	cellBorders,
}: GameCellProps) {
	const { dispatch, state } = useGame();
	const { playSound, triggerHaptic } = useAudio();
	const opacity = useSharedValue(value ? 1 : 0);

	const textAnimatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: opacity.value }],
	}));

	React.useEffect(() => {
		if (value) {
			opacity.value = withSpring(1, { damping: 8 });
		}
	}, [value, opacity]);

	const handlePress = async () => {
		if (disabled) return;

		// Level 1: Classic Tic-Tac-Toe - simple placement
		if (state.gameLevel === 1) {
			if (value) return; // Can't place on occupied cell

			await Promise.all([playSound('move'), triggerHaptic('medium')]);

			setTimeout(() => {
				dispatch({ type: 'MAKE_MOVE', index });
			}, 100);
			return;
		}

		// Level 2: Morris game logic
		if (state.gameLevel === 2) {
			// In placement phase, allow placing if cell is empty
			if (state.gamePhase === 'placement') {
				if (value) return;

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
		}
	};

	const getTextColor = () => {
		if (value === 'X') return '#10b981';
		if (value === 'O') return '#ef4444';
		return '#fff';
	};

	const getBackgroundColor = () => {
		// Highlight selected piece
		if (state.selectedPiece === index) {
			return '#fbbf24' + '30'; // Yellow with transparency for selected
		}

		// Show valid move targets when a piece is selected
		if (
			state.selectedPiece !== null &&
			value === null &&
			state.gamePhase === 'movement'
		) {
			const adjacentCells = getAdjacentCells(state.selectedPiece);
			if (adjacentCells.includes(index)) {
				return '#fbbf24' + '20'; // Light yellow for valid targets
			}
		}

		return 'transparent'; // Clean background
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
		<Animated.View>
			<TouchableOpacity
				style={[
					styles.cell,
					{
						width: size,
						height: size,
						backgroundColor: getBackgroundColor(),
						...cellBorders,
					},
				]}
				onPress={handlePress}
				disabled={disabled}
				activeOpacity={0.8}
			>
				<Animated.Text
					style={[
						styles.cellText,
						textAnimatedStyle,
						{ color: getTextColor(), fontSize: size * 0.4 },
					]}
				>
					{value}
				</Animated.Text>
			</TouchableOpacity>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	cell: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	cellText: {
		fontFamily: 'Inter-Bold',
		textAlign: 'center',
	},
});
