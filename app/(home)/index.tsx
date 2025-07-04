import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GameBoard from '@/components/GameBoard';
import GameHeader from '@/components/GameHeader';
import GameOverPopup from '@/components/GameOverPopup';
import CoinPopup from '@/components/CoinPopup';
import LevelSelector from '@/components/LevelSelector';
import { useGame } from '@/context/GameProvider';
import { useTheme } from '@/context/ThemeProvider';

export default function GameScreen() {
	const { state, dispatch } = useGame();
	const { colors } = useTheme();
	const [coinPopup, setCoinPopup] = useState<{ amount: number } | null>(null);
	const [prevCoins, setPrevCoins] = useState(state.coins);

	// Track coin changes and show popup
	useEffect(() => {
		if (state.coins > prevCoins) {
			const earnedCoins = state.coins - prevCoins;
			setCoinPopup({ amount: earnedCoins });
		}
		setPrevCoins(state.coins);
	}, [state.coins, prevCoins]);

	const handleOverlayPress = () => {
		if (state.winner) {
			dispatch({ type: 'RESET_GAME' });
		}
	};

	const handleCoinPopupComplete = useCallback(() => {
		setCoinPopup(null);
	}, []);

	return (
		<LinearGradient colors={colors.background} style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<TouchableOpacity
					style={styles.content}
					activeOpacity={1}
					onPress={handleOverlayPress}
				>
					<GameHeader />
					<GameBoard />
					<LevelSelector />
					<GameOverPopup />
					{coinPopup && (
						<CoinPopup
							key={coinPopup.amount}
							amount={coinPopup.amount}
							onComplete={handleCoinPopupComplete}
						/>
					)}
				</TouchableOpacity>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	content: {
		flex: 1,
		padding: 20,
	},
});
