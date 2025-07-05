import React, { useRef, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import GameCell from './GameCell';
import WinningLine from './WinningLine';
import { useGame } from '../context/GameProvider';
import { useTheme } from '@/context/ThemeProvider';

const { width } = Dimensions.get('window');
const boardSize = Math.min(width - 60, 280);
const cellSize = boardSize / 3;

export default function GameBoard() {
	const { state, dispatch } = useGame();
	const { colors } = useTheme();
	const timeoutRef = useRef<number | null>(null);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const handleWinningLineComplete = () => {
		try {
			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// After the winning line animation completes, reset the game
			timeoutRef.current = setTimeout(() => {
				if (state.winner) {
					dispatch({ type: 'RESET_GAME' });
				}
				timeoutRef.current = null;
			}, 500);
		} catch (error) {
			console.error('Error in handleWinningLineComplete:', error);
			// Fallback: still reset the game even if there's an error
			dispatch({ type: 'RESET_GAME' });
		}
	};

	// Helper function to determine which borders a cell should have
	const getCellBorders = (index: number) => {
		const row = Math.floor(index / 3);
		const col = index % 3;

		return {
			borderRightWidth: col < 2 ? 2 : 0, // Right border for first two columns
			borderBottomWidth: row < 2 ? 2 : 0, // Bottom border for first two rows
			borderColor: colors.border,
		};
	};

	return (
		<View style={styles.container}>
			<Animated.View
				entering={FadeInUp.delay(200).springify()}
				style={[
					styles.board,
					{
						width: boardSize,
						height: boardSize,
					},
				]}
			>
				{state.board.map((cell, index) => (
					<GameCell
						key={index}
						index={index}
						value={cell}
						size={cellSize}
						cellBorders={getCellBorders(index)}
						disabled={
							!state.isGameActive ||
							(state.gameMode === 'vsAI' && state.currentPlayer === 'O')
						}
					/>
				))}

				{/* Winning Line Animation */}
				{state.winner && state.winner !== 'draw' && (
					<WinningLine
						winPattern={state.winningPattern}
						cellSize={cellSize}
						onAnimationComplete={handleWinningLineComplete}
					/>
				)}
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	board: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
});
