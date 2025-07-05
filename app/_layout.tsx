import React from 'react';
import {
	Inter_400Regular,
	Inter_600SemiBold,
	Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as Fonts from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
// import * as SystemUI from 'expo-system-ui';
import { AudioProvider } from '@/context/AudioProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import GameProvider from '@/context/GameProvider';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { View } from 'react-native';
import { db } from '@/db/connection';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	const { success, error } = useMigrations(db, migrations);
	const [appIsReady, setAppIsReady] = React.useState(false);

	if (error) {
		console.error('Migration error:', error);
	}

	// React.useEffect(() => {
	// 	SystemUI.setBackgroundColorAsync('transparent');
	// 	SystemUI.setStatusBarStyleAsync('light');
	// 	SystemUI.setStatusBarTranslucentAsync(true);
	// }, []);

	React.useEffect(() => {
		async function prepare() {
			try {
				await Fonts.loadAsync({
					Inter_400Regular,
					Inter_600SemiBold,
					Inter_700Bold,
				});
			} catch (e) {
				console.warn('Error loading fonts:', e);
			} finally {
				setAppIsReady(true);
			}
		}

		prepare();
	}, []);

	const onLayoutRootView = React.useCallback(async () => {
		if (appIsReady) {
			await SplashScreen.hideAsync();
		}
	}, [appIsReady]);

	if (!appIsReady || !success) {
		return null;
	}

	return (
		<View style={{ flex: 1 }} onLayout={onLayoutRootView}>
			<ThemeProvider>
				<GameProvider>
					<AudioProvider>
						<Stack screenOptions={{ headerShown: false }}>
							<Stack.Screen name='(home)' />
							<Stack.Screen name='+not-found' />
						</Stack>
					</AudioProvider>
				</GameProvider>
			</ThemeProvider>
		</View>
	);
}
