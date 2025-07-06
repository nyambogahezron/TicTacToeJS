import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useGame } from '../context/GameProvider';
import { useTheme } from '@/context/ThemeProvider';

export default function DetailedLevelSelector() {
	const { state, dispatch } = useGame();
	const { colors } = useTheme();

	const levels = [
		{
			id: 1,
			name: 'Level 1',
			subtitle: 'Classic Tic-Tac-Toe',
			description: 'Place unlimited pieces to get 3 in a row',
		},
		{
			id: 2,
			name: 'Level 2',
			subtitle: "Three Men's Morris",
			description: 'Place 3 pieces, then move to adjacent cells',
		},
		{
			id: 3,
			name: 'Level 3',
			subtitle: 'Restricted Morris',
			description:
				'Place 3 pieces, then move only in straight lines (no diagonal)',
			disabled: false,
		},
	];

	const handleLevelChange = (levelId: number) => {
		dispatch({ type: 'SET_GAME_LEVEL', level: levelId });
	};

	return (
		<Animated.View
			entering={FadeInUp.delay(300).springify()}
			style={styles.container}
		>
			<Text style={[styles.title, { color: colors.text }]}>Game Levels</Text>
			<View style={styles.levelList}>
				{levels.map((level, index) => (
					<TouchableOpacity
						key={level.id}
						style={[
							styles.levelCard,
							{
								backgroundColor: colors.card,
								borderColor:
									state.gameLevel === level.id ? colors.primary : colors.border,
								borderWidth: state.gameLevel === level.id ? 2 : 1,
								opacity: level.disabled ? 0.5 : 1,
							},
						]}
						onPress={() => handleLevelChange(level.id)}
						disabled={level.disabled}
						activeOpacity={0.8}
					>
						<View style={styles.levelContent}>
							<View style={styles.levelHeader}>
								<Text
									style={[
										styles.levelName,
										{
											color:
												state.gameLevel === level.id
													? colors.primary
													: colors.cardText,
										},
									]}
								>
									{level.name}
								</Text>
								{state.gameLevel === level.id && (
									<View
										style={[
											styles.activeBadge,
											{ backgroundColor: colors.primary },
										]}
									>
										<Text style={styles.activeBadgeText}>ACTIVE</Text>
									</View>
								)}
								{level.disabled && (
									<View style={styles.disabledBadge}>
										<Text
											style={[
												styles.disabledBadgeText,
												{ color: colors.cardSubtext },
											]}
										>
											SOON
										</Text>
									</View>
								)}
							</View>
							<Text
								style={[styles.levelSubtitle, { color: colors.cardSubtext }]}
							>
								{level.subtitle}
							</Text>
							<Text
								style={[styles.levelDescription, { color: colors.cardSubtext }]}
							>
								{level.description}
							</Text>
						</View>
					</TouchableOpacity>
				))}
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 24,
	},
	title: {
		fontSize: 20,
		fontFamily: 'Inter-Bold',
		marginBottom: 16,
	},
	levelList: {
		gap: 12,
	},
	levelCard: {
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
	},
	levelContent: {
		flex: 1,
	},
	levelHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	levelName: {
		fontSize: 18,
		fontFamily: 'Inter-SemiBold',
		flex: 1,
	},
	activeBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	activeBadgeText: {
		fontSize: 10,
		fontFamily: 'Inter-Bold',
		color: '#fff',
	},
	disabledBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	disabledBadgeText: {
		fontSize: 10,
		fontFamily: 'Inter-Bold',
	},
	levelSubtitle: {
		fontSize: 14,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 4,
	},
	levelDescription: {
		fontSize: 13,
		fontFamily: 'Inter-Regular',
		lineHeight: 18,
	},
});
