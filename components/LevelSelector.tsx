import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useGame } from '../context/GameProvider';
import { useTheme } from '@/context/ThemeProvider';

export default function LevelSelector() {
	const { state, dispatch } = useGame();
	const { colors } = useTheme();

	const levels = [
		{ id: 1, name: 'L1', disabled: false },
		{ id: 2, name: 'L2', disabled: false },
		{ id: 3, name: 'L3', disabled: false },
	];

	const handleLevelChange = (levelId: number) => {
		dispatch({ type: 'SET_GAME_LEVEL', level: levelId });
	};

	return (
		<Animated.View
			entering={FadeInUp.delay(400).springify()}
			style={styles.container}
		>
			{levels.map((level) => (
				<TouchableOpacity
					key={level.id}
					style={[
						styles.levelButton,
						{
							backgroundColor:
								state.gameLevel === level.id ? colors.primary : colors.card,
							borderColor: colors.border,
							opacity: level.disabled ? 0.3 : 1,
						},
					]}
					onPress={() => handleLevelChange(level.id)}
					disabled={level.disabled}
					activeOpacity={0.8}
				>
					<Text
						style={[
							styles.levelText,
							{
								color: state.gameLevel === level.id ? '#fff' : colors.text,
							},
						]}
					>
						{level.name}
					</Text>
				</TouchableOpacity>
			))}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
		marginTop: 16,
	},
	levelButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	levelText: {
		fontSize: 12,
		fontFamily: 'Inter-SemiBold',
	},
});
