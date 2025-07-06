import React, { useEffect, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
} from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withSequence,
	runOnJS,
} from 'react-native-reanimated';
import { Award, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAchievements } from '@/context/AchievementsProvider';
import { useAudio } from '@/context/AudioProvider';

const { width } = Dimensions.get('window');

export default function AchievementPopup() {
	const { colors } = useTheme();
	const { showAchievementPopup, newAchievement, dismissAchievementPopup } =
		useAchievements();
	const { playSound, triggerHaptic } = useAudio();

	const scale = useSharedValue(0);
	const translateY = useSharedValue(50);
	const opacity = useSharedValue(0);

	const handleDismiss = useCallback(() => {
		scale.value = withSequence(
			withSpring(1.1, { duration: 150 }),
			withSpring(0, { duration: 200 }, (finished) => {
				if (finished) {
					runOnJS(dismissAchievementPopup)();
				}
			})
		);
		translateY.value = withSpring(50);
		opacity.value = withSpring(0);
	}, [scale, translateY, opacity, dismissAchievementPopup]);

	useEffect(() => {
		if (showAchievementPopup && newAchievement) {
			// Play achievement sound and haptic
			playSound('win');
			triggerHaptic('success');

			// Animate in
			scale.value = withSpring(1, { damping: 15 });
			translateY.value = withSpring(0, { damping: 15 });
			opacity.value = withSpring(1);

			// Auto-hide after 3 seconds
			setTimeout(() => {
				handleDismiss();
			}, 3000);
		} else {
			// Animate out
			scale.value = withSpring(0);
			translateY.value = withSpring(50);
			opacity.value = withSpring(0);
		}
	}, [
		showAchievementPopup,
		newAchievement,
		handleDismiss,
		opacity,
		playSound,
		scale,
		translateY,
		triggerHaptic,
	]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }, { translateY: translateY.value }],
		opacity: opacity.value,
	}));

	if (!showAchievementPopup || !newAchievement) {
		return null;
	}

	return (
		<View
			style={styles.overlay}
			pointerEvents={showAchievementPopup ? 'auto' : 'none'}
		>
			<Animated.View
				style={[
					styles.popup,
					{
						backgroundColor: colors.card,
						borderColor: colors.border,
					},
					animatedStyle,
				]}
			>
				<TouchableOpacity
					style={[
						styles.closeButton,
						{ backgroundColor: colors.background as any },
					]}
					onPress={handleDismiss}
					activeOpacity={0.8}
				>
					<X size={16} color={colors.text} />
				</TouchableOpacity>

				<View style={styles.content}>
					<View
						style={[
							styles.iconContainer,
							{ backgroundColor: '#10b981' + '20' },
						]}
					>
						<Text style={styles.achievementIcon}>{newAchievement.icon}</Text>
						<View style={[styles.badge, { backgroundColor: '#10b981' }]}>
							<Award size={16} color='#fff' />
						</View>
					</View>

					<View style={styles.textContainer}>
						<Text style={[styles.title, { color: colors.text }]}>
							Achievement Unlocked!
						</Text>
						<Text style={[styles.achievementTitle, { color: colors.text }]}>
							{newAchievement.title}
						</Text>
						<Text style={[styles.description, { color: colors.cardSubtext }]}>
							{newAchievement.description}
						</Text>
					</View>

					<View
						style={[
							styles.rewardContainer,
							{ backgroundColor: '#f59e0b' + '20' },
						]}
					>
						<Text style={[styles.rewardText, { color: '#f59e0b' }]}>
							+{newAchievement.coinReward} coins
						</Text>
					</View>
				</View>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	popup: {
		width: width * 0.85,
		borderRadius: 20,
		borderWidth: 1,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 15,
		elevation: 15,
	},
	closeButton: {
		position: 'absolute',
		top: 10,
		right: 10,
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
	content: {
		alignItems: 'center',
	},
	iconContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16,
		position: 'relative',
	},
	achievementIcon: {
		fontSize: 40,
	},
	badge: {
		position: 'absolute',
		bottom: -5,
		right: -5,
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textContainer: {
		alignItems: 'center',
		marginBottom: 16,
	},
	title: {
		fontSize: 14,
		fontFamily: 'Inter-Medium',
		marginBottom: 4,
		opacity: 0.8,
	},
	achievementTitle: {
		fontSize: 20,
		fontFamily: 'Inter-Bold',
		marginBottom: 8,
		textAlign: 'center',
	},
	description: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		textAlign: 'center',
		lineHeight: 20,
	},
	rewardContainer: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 12,
	},
	rewardText: {
		fontSize: 16,
		fontFamily: 'Inter-SemiBold',
	},
});
