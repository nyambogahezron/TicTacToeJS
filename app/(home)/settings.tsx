import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Switch,
	TouchableOpacity,
	ScrollView,
	Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
	Volume2,
	Vibrate,
	Bot,
	Moon,
	ExternalLink,
	Users,
	Gamepad2,
} from 'lucide-react-native';
import { useAudio } from '@/context/AudioProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useGame } from '@/context/GameProvider';
import DetailedLevelSelector from '@/components/DetailedLevelSelector';
import PageHeader from '@/components/PageHeader';

export default function SettingsScreen() {
	const { soundEnabled, hapticEnabled, toggleSound, toggleHaptic } = useAudio();
	const { isDarkMode, toggleTheme, colors } = useTheme();
	const { state, dispatch } = useGame();
	const insets = useSafeAreaInsets();
	const [aiDifficulty, setAiDifficulty] = React.useState(true);

	const SettingItem = ({
		icon: Icon,
		title,
		description,
		value,
		onValueChange,
		color,
	}: any) => (
		<Animated.View
			entering={FadeInUp.delay(200).springify()}
			style={[styles.settingCard, { backgroundColor: colors.card }]}
		>
			<View style={styles.settingIcon}>
				<Icon size={24} color={color} />
			</View>
			<View style={styles.settingContent}>
				<Text style={[styles.settingTitle, { color: colors.cardText }]}>
					{title}
				</Text>
				<Text
					style={[styles.settingDescription, { color: colors.cardSubtext }]}
				>
					{description}
				</Text>
			</View>
			<Switch
				value={value}
				onValueChange={onValueChange}
				trackColor={{ false: '#374151', true: '#60a5fa' }}
				thumbColor={value ? '#fff' : '#9ca3af'}
			/>
		</Animated.View>
	);

	const GameModeSelectorSetting = () => {
		const gameModes = [
			{
				id: 'vsAI' as const,
				name: 'vs AI',
				icon: Bot,
				description: 'Play against computer',
			},
			{
				id: 'vsPlayer' as const,
				name: 'vs Player',
				icon: Users,
				description: 'Play with a friend',
			},
		];

		const handleModeChange = (mode: 'vsAI' | 'vsPlayer') => {
			dispatch({ type: 'SET_GAME_MODE', mode });
			// Reset the game when switching modes to avoid confusion
			dispatch({ type: 'RESET_GAME' });
		};

		return (
			<Animated.View
				entering={FadeInUp.delay(300).springify()}
				style={[styles.settingCard, { backgroundColor: colors.card }]}
			>
				<View style={styles.settingIcon}>
					<Gamepad2 size={24} color='#8b5cf6' />
				</View>
				<View style={styles.settingContent}>
					<Text style={[styles.settingTitle, { color: colors.cardText }]}>
						Game Mode
					</Text>
					<Text
						style={[styles.settingDescription, { color: colors.cardSubtext }]}
					>
						Choose how you want to play
					</Text>
					<View style={styles.gameModeOptions}>
						{gameModes.map((mode) => {
							const IconComponent = mode.icon;
							const isSelected = state.gameMode === mode.id;

							return (
								<TouchableOpacity
									key={mode.id}
									style={[
										styles.gameModeButton,
										{
											backgroundColor: isSelected
												? '#8b5cf6'
												: colors.background[1],
											borderColor: isSelected ? '#8b5cf6' : colors.border,
										},
									]}
									onPress={() => handleModeChange(mode.id)}
									activeOpacity={0.8}
								>
									<IconComponent
										size={16}
										color={isSelected ? '#fff' : colors.cardText}
									/>
									<Text
										style={[
											styles.gameModeText,
											{
												color: isSelected ? '#fff' : colors.cardText,
											},
										]}
									>
										{mode.name}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>
			</Animated.View>
		);
	};

	return (
		<LinearGradient colors={colors.background} style={styles.container}>
			<View style={[styles.content, { paddingTop: insets.top }]}>
				<PageHeader title='Settings' />

				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.settingsContainer}>
						<SettingItem
							icon={Volume2}
							title='Sound Effects'
							description='Enable game sound effects'
							value={soundEnabled}
							onValueChange={toggleSound}
							color='#10b981'
						/>
						<SettingItem
							icon={Vibrate}
							title='Haptic Feedback'
							description='Vibration on interactions'
							value={hapticEnabled}
							onValueChange={toggleHaptic}
							color='#f59e0b'
						/>
						<GameModeSelectorSetting />
						<SettingItem
							icon={Bot}
							title='Hard AI'
							description='Enable challenging AI opponent'
							value={aiDifficulty}
							onValueChange={setAiDifficulty}
							color='#ef4444'
						/>
						<SettingItem
							icon={Moon}
							title='Dark Mode'
							description='Use dark theme'
							value={isDarkMode}
							onValueChange={toggleTheme}
							color='#60a5fa'
						/>
					</View>

					<DetailedLevelSelector />

					{/* Footer Section */}
					<View style={styles.footer}>
						<Animated.View
							entering={FadeInUp.delay(400).springify()}
							style={[styles.footerCard, { backgroundColor: colors.card }]}
						>
							<Text style={[styles.versionText, { color: colors.cardSubtext }]}>
								Version 1.0.0
							</Text>
							<TouchableOpacity
								style={styles.developerLink}
								onPress={() =>
									Linking.openURL('https://github.com/nyambogahezron')
								}
								activeOpacity={0.7}
							>
								<ExternalLink size={16} color={colors.cardSubtext} />
								<Text
									style={[styles.developerText, { color: colors.cardSubtext }]}
								>
									Developer
								</Text>
							</TouchableOpacity>
						</Animated.View>
					</View>
				</ScrollView>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
	},

	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 15,
		paddingBottom: 40,
	},
	settingsContainer: {
		gap: 16,
		marginTop: 20,
	},
	settingCard: {
		borderRadius: 16,
		padding: 20,
		flexDirection: 'row',
		alignItems: 'center',
		backdropFilter: 'blur(10px)',
	},
	settingIcon: {
		marginRight: 16,
	},
	settingContent: {
		flex: 1,
	},
	settingTitle: {
		fontSize: 18,
		fontFamily: 'Inter-SemiBold',
		marginBottom: 4,
	},
	settingDescription: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
	},
	footer: {
		marginTop: 40,
		paddingBottom: 40,
	},
	footerCard: {
		borderRadius: 16,
		padding: 20,
		alignItems: 'center',
		backdropFilter: 'blur(10px)',
		gap: 12,
	},
	versionText: {
		fontSize: 14,
		fontFamily: 'Inter-Medium',
	},
	developerLink: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	developerText: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		textDecorationLine: 'underline',
	},
	gameModeOptions: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 12,
	},
	gameModeButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		gap: 6,
	},
	gameModeText: {
		fontSize: 13,
		fontFamily: 'Inter-Medium',
	},
});
