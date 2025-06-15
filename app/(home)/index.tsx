import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GameBoard from '@/components/GameBoard';
import GameHeader from '@/components/GameHeader';
import GameOverPopup from '@/components/GameOverPopup';
import { useGame } from '@/context/GameProvider';
import { useTheme } from '@/context/ThemeProvider';

export default function GameScreen() {
	const { state, dispatch } = useGame();
	const { colors } = useTheme();

	const handleOverlayPress = () => {
		if (state.winner) {
			dispatch({ type: 'RESET_GAME' });
		}
	};

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
					<GameOverPopup />
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
