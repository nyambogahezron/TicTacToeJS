import React, { useState, useEffect, useCallback, memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GameBoard from '@/components/GameBoard';
import GameHeader from '@/components/GameHeader';
import GameOverPopup from '@/components/GameOverPopup';
import CoinPopup from '@/components/CoinPopup';
import LevelSelector from '@/components/LevelSelector';
import { useGame } from '@/context/GameProvider';
import { useTheme } from '@/context/ThemeProvider';

const GameScreen = memo(function GameScreen() {
	const { state, dispatch } = useGame();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const [coinPopup, setCoinPopup] = useState<{ amount: number } | null>(null);
	const [prevCoins, setPrevCoins] = useState(state.coins);

	useEffect(() => {
		if (state.coins > prevCoins) {
			const earnedCoins = state.coins - prevCoins;
			setCoinPopup({ amount: earnedCoins });
		}
		setPrevCoins(state.coins);
	}, [state.coins, prevCoins]);

	const handleOverlayPress = useCallback(() => {
		if (state.winner) {
			dispatch({ type: 'RESET_GAME' });
		}
	}, [state.winner, dispatch]);

	const handleCoinPopupComplete = useCallback(() => {
		setCoinPopup(null);
	}, []);

	return (
		<LinearGradient colors={colors.background} style={styles.container}>
			<View style={[styles.content, { paddingTop: insets.top }]}>
				<TouchableOpacity
					style={styles.gameArea}
					activeOpacity={1}
					onPress={handleOverlayPress}
				>
					<GameHeader />
					<GameBoard />
					<LevelSelector />
					<GameOverPopup />
					{coinPopup && (
						<CoinPopup
							key={`coin-${coinPopup.amount}-${Date.now()}`}
							amount={coinPopup.amount}
							onComplete={handleCoinPopupComplete}
						/>
					)}
				</TouchableOpacity>
			</View>
		</LinearGradient>
	);
});

export default GameScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	gameArea: {
		flex: 1,
	},
});
