import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import GameCell from './GameCell';
import { useGame } from '../context/GameProvider';
import { useTheme } from '@/context/ThemeProvider';

const { width } = Dimensions.get('window');
const boardSize = Math.min(width - 30, 400);
const cellSize = (boardSize - 20) / 3.2;

export default function GameBoard() {
	const { state } = useGame();
	const { colors } = useTheme();

	return (
		<View style={styles.container}>
			<Animated.View
				entering={FadeInUp.delay(200).springify()}
				style={[
					styles.board,
					{
						width: boardSize,
						height: boardSize,
						backgroundColor: colors.card,
						borderColor: colors.border,
					},
				]}
			>
				{state.board.map((cell, index) => (
					<GameCell
						key={index}
						index={index}
						value={cell}
						size={cellSize}
						disabled={
							!state.isGameActive ||
							(state.gameMode === 'vsAI' && state.currentPlayer === 'O')
						}
					/>
				))}
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
		borderRadius: 20,
		padding: 10,
		gap: 5,
		width: '100%',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		alignContent: 'center',
		borderWidth: 2,
	},
});
