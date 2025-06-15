import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Volume2, Vibrate, Bot, Moon } from 'lucide-react-native';
import { useAudio } from '@/context/AudioProvider';

export default function SettingsScreen() {
	const { soundEnabled, hapticEnabled, toggleSound, toggleHaptic } = useAudio();
	const [aiDifficulty, setAiDifficulty] = React.useState(true);
	const [darkMode, setDarkMode] = React.useState(true);

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
			style={styles.settingCard}
		>
			<View style={styles.settingIcon}>
				<Icon size={24} color={color} />
			</View>
			<View style={styles.settingContent}>
				<Text style={styles.settingTitle}>{title}</Text>
				<Text style={styles.settingDescription}>{description}</Text>
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
		<LinearGradient
			colors={['#0f172a', '#1e293b', '#334155']}
			style={styles.container}
		>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.content}>
					<Animated.Text entering={FadeInUp.springify()} style={styles.title}>
						Settings
					</Animated.Text>

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
							value={darkMode}
							onValueChange={setDarkMode}
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
	title: {
		fontSize: 32,
		fontFamily: 'Inter-Bold',
		color: '#fff',
		textAlign: 'center',
		marginBottom: 40,
	},
	settingsContainer: {
		gap: 16,
	},
	settingCard: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
		color: '#fff',
		marginBottom: 4,
	},
	settingDescription: {
		fontSize: 14,
		fontFamily: 'Inter-Regular',
		color: '#94a3b8',
	},
});
