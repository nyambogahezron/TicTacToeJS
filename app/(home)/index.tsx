import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GameBoard from '@/components/GameBoard';
import GameHeader from '@/components/GameHeader';
import GameProvider from '@/context/GameProvider';
import GameOverPopup from '@/components/GameOverPopup';
import { useGame } from '@/context/GameProvider';

function GameScreenContent() {
	const { state, dispatch } = useGame();

	const handleOverlayPress = () => {
		if (state.winner) {
			dispatch({ type: 'RESET_GAME' });
		}
	};

	return (
		<LinearGradient
			colors={['#0f172a', '#1e293b', '#334155']}
			style={styles.container}
		>
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

export default function GameScreen() {
	return (
		<GameProvider>
			<GameScreenContent />
		</GameProvider>
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
