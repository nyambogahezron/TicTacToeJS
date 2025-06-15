import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Volume2, Vibrate, Bot, Moon, ArrowLeft } from 'lucide-react-native';
import { useAudio } from '@/context/AudioProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
	const { soundEnabled, hapticEnabled, toggleSound, toggleHaptic } = useAudio();
	const { isDarkMode, toggleTheme, colors } = useTheme();
	const router = useRouter();
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

	return (
		<LinearGradient colors={colors.background} style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.content}>
					<View style={styles.header}>
						<TouchableOpacity
							style={styles.backButton}
							onPress={() => router.back()}
							activeOpacity={0.8}
						>
							<ArrowLeft size={24} color={colors.text} />
						</TouchableOpacity>
						<Animated.Text
							entering={FadeInUp.springify()}
							style={[styles.title, { color: colors.text }]}
						>
							Settings
						</Animated.Text>
						<View style={styles.backButton} />
					</View>

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
				</View>
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
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 40,
	},
	backButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 32,
		fontFamily: 'Inter-Bold',
		textAlign: 'center',
	},
	settingsContainer: {
		gap: 16,
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
});
