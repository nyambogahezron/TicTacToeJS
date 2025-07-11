import React, { memo, useMemo, useCallback } from 'react';
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

const GameCell = memo(function GameCell({
	index,
	value,
	size,
	disabled,
	cellBorders,
}: GameCellProps) {
	const { dispatch, state } = useGame();
	const { playSound, triggerHaptic } = useAudio();
	const opacity = useSharedValue(value ? 1 : 0);

	// Helper function to get adjacent cells
	const getAdjacentCells = useCallback((cellIndex: number): number[] => {
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
	}, []);

	// Helper function to get straight-line adjacent cells (Level 3)
	const getStraightLineAdjacentCells = useCallback(
		(cellIndex: number): number[] => {
			const adjacencyMap: { [key: number]: number[] } = {
				0: [1, 3], // Only right and down
				1: [0, 2, 4], // Left, right, and down
				2: [1, 5], // Only left and down
				3: [0, 4, 6], // Up, right, and down
				4: [1, 3, 5, 7], // Up, left, right, and down (no diagonals)
				5: [2, 4, 8], // Up, left, and down
				6: [3, 7], // Only up and right
				7: [4, 6, 8], // Left, up, and right
				8: [5, 7], // Only left and up
			};
			return adjacencyMap[cellIndex] || [];
		},
		[]
	);

	const textAnimatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: opacity.value }],
	}));

	React.useEffect(() => {
		if (value) {
			opacity.value = withSpring(1, { damping: 8 });
		}
	}, [value, opacity]);

	const handlePress = useCallback(async () => {
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

		// Level 3: Restricted Morris game logic (straight-line movement only)
		if (state.gameLevel === 3) {
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

					// Check if move is valid (straight-line adjacent to selected piece)
					const adjacentCells = getStraightLineAdjacentCells(
						state.selectedPiece
					);
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
	}, [
		disabled,
		value,
		state.gameLevel,
		state.gamePhase,
		state.currentPlayer,
		state.selectedPiece,
		playSound,
		triggerHaptic,
		dispatch,
		index,
		getAdjacentCells,
		getStraightLineAdjacentCells,
	]);

	const getTextColor = useCallback(() => {
		if (value === 'X') return '#10b981';
		if (value === 'O') return '#ef4444';
		return '#fff';
	}, [value]);

	const getBackgroundColor = useCallback(() => {
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
			// Use different adjacency logic based on game level
			let adjacentCells: number[];
			if (state.gameLevel === 3) {
				// Level 3: Only straight-line movement
				adjacentCells = getStraightLineAdjacentCells(state.selectedPiece);
			} else {
				// Level 2: Regular adjacent movement (including diagonals)
				adjacentCells = getAdjacentCells(state.selectedPiece);
			}

			if (adjacentCells.includes(index)) {
				return '#fbbf24' + '20'; // Light yellow for valid targets
			}
		}

		return 'transparent'; // Clean background
	}, [
		state.selectedPiece,
		value,
		state.gamePhase,
		state.gameLevel,
		getAdjacentCells,
		getStraightLineAdjacentCells,
		index,
	]);

	const cellStyle = useMemo(
		() => [
			styles.cell,
			{
				width: size,
				height: size,
				backgroundColor: getBackgroundColor(),
				...cellBorders,
			},
		],
		[size, getBackgroundColor, cellBorders]
	);

	const textStyle = useMemo(
		() => [
			styles.cellText,
			textAnimatedStyle,
			{ color: getTextColor(), fontSize: size * 0.4 },
		],
		[textAnimatedStyle, getTextColor, size]
	);

	return (
		<Animated.View>
			<TouchableOpacity
				style={cellStyle}
				onPress={handlePress}
				disabled={disabled}
				activeOpacity={0.8}
			>
				<Animated.Text style={textStyle}>{value}</Animated.Text>
			</TouchableOpacity>
		</Animated.View>
	);
});

export default GameCell;

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
