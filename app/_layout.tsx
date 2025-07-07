import React from 'react';
import {
	Inter_400Regular,
	Inter_600SemiBold,
	Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as Fonts from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider } from '@/context/AudioProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import GameProvider from '@/context/GameProvider';
import { AchievementsProvider } from '@/context/AchievementsProvider';
import AchievementPopup from '@/components/AchievementPopup';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { View, Platform } from 'react-native';
import { db } from '@/db/connection';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	const { success, error } = useMigrations(db, migrations);
	const [appIsReady, setAppIsReady] = React.useState(false);
	const [hasSeenWelcome, setHasSeenWelcome] = React.useState<boolean | null>(
		null
	);

	if (error) {
		console.error('Migration error:', error);
	}

	useDrizzleStudio(db.$client);

	React.useEffect(() => {
		if (Platform.OS === 'android') {
			SystemUI.setBackgroundColorAsync('transparent');
		} else {
			SystemUI.setBackgroundColorAsync('#e2e8f0');
		}
	}, []);

	React.useEffect(() => {
		async function prepare() {
			try {
				await Fonts.loadAsync({
					Inter_400Regular,
					Inter_600SemiBold,
					Inter_700Bold,
				});

				const welcomed = await AsyncStorage.getItem('hasSeenWelcome');
				setHasSeenWelcome(welcomed === 'true');
			} catch (e) {
				console.warn('Error loading fonts:', e);
			} finally {
				setAppIsReady(true);
			}
		}

		prepare();
	}, []);

	const onLayoutRootView = React.useCallback(async () => {
		if (appIsReady && hasSeenWelcome !== null) {
			await SplashScreen.hideAsync();
		}
	}, [appIsReady, hasSeenWelcome]);

	const handleWelcomeContinue = () => {
		setHasSeenWelcome(true);
	};

	if (!appIsReady || !success || hasSeenWelcome === null) {
		return null;
	}

	if (!hasSeenWelcome) {
		return (
			<SafeAreaProvider>
				<View style={{ flex: 1 }} onLayout={onLayoutRootView}>
					<ThemeProvider>
						<WelcomeScreen onContinue={handleWelcomeContinue} />
					</ThemeProvider>
				</View>
			</SafeAreaProvider>
		);
	}

	return (
		<SafeAreaProvider>
			<View style={{ flex: 1 }} onLayout={onLayoutRootView}>
				<ThemeProvider>
					<GameProvider>
						<AchievementsProvider>
							<AudioProvider>
								<Stack screenOptions={{ headerShown: false }}>
									<Stack.Screen name='(home)' />
									<Stack.Screen name='+not-found' />
								</Stack>
								<AchievementPopup />
							</AudioProvider>
						</AchievementsProvider>
					</GameProvider>
				</ThemeProvider>
			</View>
		</SafeAreaProvider>
	);
}
